<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GithubBranch;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GithubController extends Controller
{
    public function index(Task $task)
    {
        return response()->json([
            'branches' => $task->githubBranches()->with('user')->latest()->get(),
        ]);
    }

    public function createBranch(Request $request, Task $task)
    {
        abort_unless(
            (int) $task->assigned_to === (int) $request->user()->id,
            403,
            'Vous devez être assigné à cette tâche pour créer une branche.'
        );

        $token = config('services.github.token');
        $owner = config('services.github.owner');
        $repo = config('services.github.repo');
        $baseBranch = config('services.github.base_branch');

        if (! $token || ! $owner || ! $repo) {
            return response()->json([
                'message' => 'Intégration GitHub non configurée (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO dans le .env).',
            ], 422);
        }

        $branchName = 'feature/task-'.$task->id.'-'.Str::slug($task->title);

        $githubApi = Http::withToken($token)
            ->acceptJson()
            ->baseUrl('https://api.github.com');

        $baseRef = $githubApi->get("/repos/{$owner}/{$repo}/git/ref/heads/{$baseBranch}");

        if ($baseRef->failed()) {
            return response()->json([
                'message' => 'Impossible de récupérer la branche de base sur GitHub.',
                'details' => $baseRef->json(),
            ], 502);
        }

        $baseSha = $baseRef->json('object.sha');

        $createRef = $githubApi->post("/repos/{$owner}/{$repo}/git/refs", [
            'ref' => "refs/heads/{$branchName}",
            'sha' => $baseSha,
        ]);

        if ($createRef->failed()) {
            return response()->json([
                'message' => 'Impossible de créer la branche sur GitHub.',
                'details' => $createRef->json(),
            ], 502);
        }

        $branch = GithubBranch::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'branch_name' => $branchName,
            'github_url' => "https://github.com/{$owner}/{$repo}/tree/{$branchName}",
        ]);

        return response()->json([
            'message' => 'Branche créée avec succès',
            'branch' => $branch,
        ], 201);
    }
}
