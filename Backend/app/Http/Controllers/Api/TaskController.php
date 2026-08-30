<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['project', 'creator', 'developer'])->latest();

        if ($request->user()->role !== 'manager') {
            $query->where(function ($builder) use ($request) {
                $builder->where('assigned_to', $request->user()->id)
                    ->orWhere(function ($available) {
                        $available->whereNull('assigned_to')->where('status', 'pending');
                    });
            });
        }

        return response()->json(['tasks' => $query->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'project_id' => ['required', 'exists:projects,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'start_date' => ['nullable', 'date'],
            'status' => ['sometimes', Rule::in(['pending', 'assigned', 'in_progress', 'completed', 'expired'])],
        ]);

        $this->ensureAssignableDeveloper($data['assigned_to'] ?? null);
        $isAssigned = ! empty($data['assigned_to']);

        $task = Task::create([
            ...$data,
            'created_by' => Auth::id(),
            'assigned_at' => $isAssigned ? now() : null,
            'status' => $data['status'] ?? ($isAssigned ? 'assigned' : 'pending'),
        ]);

        return response()->json([
            'message' => 'Tâche créée avec succès',
            'task' => $task->load(['project', 'creator', 'developer']),
        ], 201);
    }

    public function show(Task $task)
    {
        return response()->json([
            'task' => $task->load(['project', 'creator', 'developer']),
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'project_id' => ['sometimes', 'exists:projects,id'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'start_date' => ['nullable', 'date'],
            'status' => ['sometimes', Rule::in(['pending', 'assigned', 'in_progress', 'completed', 'expired'])],
        ]);

        if (array_key_exists('assigned_to', $data)) {
            $this->ensureAssignableDeveloper($data['assigned_to']);
            $data['assigned_at'] = $data['assigned_to'] ? now() : null;
            if (! array_key_exists('status', $data)) {
                $data['status'] = $data['assigned_to'] ? 'assigned' : 'pending';
            }
        }

        $task->update($data);

        return response()->json([
            'message' => 'Tâche modifiée',
            'task' => $task->fresh()->load(['project', 'creator', 'developer']),
        ]);
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Tâche supprimée']);
    }

    public function assign(Request $request, Task $task)
    {
        $data = $request->validate(['assigned_to' => ['required', 'exists:users,id']]);
        $this->ensureAssignableDeveloper($data['assigned_to']);

        $task->update([
            'assigned_to' => $data['assigned_to'],
            'assigned_at' => now(),
            'status' => 'assigned',
        ]);

        return response()->json([
            'message' => 'Tâche assignée avec succès',
            'task' => $task->fresh()->load(['project', 'developer']),
        ]);
    }

    public function changeStatus(Request $request, Task $task)
    {
        $this->ensureTaskOwner($request, $task);
        $data = $request->validate([
            'status' => ['required', Rule::in(['assigned', 'in_progress', 'completed', 'expired'])],
        ]);
        $task->update($data);

        return response()->json(['message' => 'Statut modifié', 'task' => $task]);
    }

    public function take(Request $request, Task $task)
    {
        abort_unless(
            in_array($request->user()->role, ['developer', 'lead_developer'], true),
            403,
            'Action réservée aux développeurs.'
        );

        if ($task->assigned_to !== null) {
            return response()->json(['message' => 'Cette tâche est déjà assignée'], 422);
        }

        $task->update([
            'assigned_to' => $request->user()->id,
            'assigned_at' => now(),
            'status' => 'assigned',
        ]);

        return response()->json([
            'message' => 'Vous avez pris cette tâche',
            'task' => $task->fresh()->load(['project', 'developer']),
        ]);
    }

    public function start(Request $request, Task $task)
    {
        $this->ensureTaskOwner($request, $task);
        if ($task->status !== 'assigned') {
            return response()->json(['message' => 'La tâche doit être assignée avant de démarrer'], 422);
        }

        $task->update(['status' => 'in_progress']);
        return response()->json(['message' => 'Tâche démarrée', 'task' => $task]);
    }

    public function complete(Request $request, Task $task)
    {
        $this->ensureTaskOwner($request, $task);
        if ($task->status !== 'in_progress') {
            return response()->json(['message' => 'La tâche doit être en cours avant d’être terminée'], 422);
        }

        $task->update(['status' => 'completed']);
        return response()->json(['message' => 'Tâche terminée', 'task' => $task]);
    }

    private function ensureAssignableDeveloper(?int $userId): void
    {
        if ($userId === null) {
            return;
        }

        $valid = User::whereKey($userId)
            ->where('is_active', true)
            ->whereIn('role', ['developer', 'lead_developer'])
            ->exists();

        abort_unless($valid, 422, 'La tâche doit être assignée à un développeur actif.');
    }

    private function ensureTaskOwner(Request $request, Task $task): void
    {
        abort_unless(
            (int) $task->assigned_to === (int) $request->user()->id,
            403,
            'Cette tâche ne vous appartient pas.'
        );
    }
}
