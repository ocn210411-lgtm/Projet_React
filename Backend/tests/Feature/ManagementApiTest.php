<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_can_manage_users_with_roles(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        Sanctum::actingAs($manager);

        $created = $this->postJson('/api/users', [
            'name' => 'Awa Diop',
            'email' => 'awa@example.com',
            'password' => 'password123',
            'role' => 'lead_developer',
        ])->assertCreated()->assertJsonPath('user.role', 'lead_developer');

        $userId = $created->json('user.id');

        $this->putJson("/api/users/{$userId}", [
            'name' => 'Awa Ndiaye',
            'email' => 'awa@example.com',
            'role' => 'developer',
        ])->assertOk()->assertJsonPath('user.role', 'developer');

        $this->deleteJson("/api/users/{$userId}")->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    public function test_task_can_be_created_assigned_started_and_completed(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $developer = User::factory()->create(['role' => 'developer']);
        $project = Project::create([
            'name' => 'Application mobile',
            'description' => 'Version initiale',
            'manager_id' => $manager->id,
        ]);

        Sanctum::actingAs($manager);
        $created = $this->postJson('/api/tasks', [
            'title' => 'Créer le tableau de bord',
            'description' => 'Intégrer la maquette validée',
            'project_id' => $project->id,
            'assigned_to' => $developer->id,
            'start_date' => now()->toDateString(),
        ])->assertCreated()
            ->assertJsonPath('task.status', 'assigned')
            ->assertJsonPath('task.developer.id', $developer->id);

        $taskId = $created->json('task.id');

        Sanctum::actingAs($developer);
        $this->getJson('/api/tasks')->assertOk()->assertJsonPath('tasks.0.id', $taskId);
        $this->putJson("/api/tasks/{$taskId}/start")->assertOk()->assertJsonPath('task.status', 'in_progress');
        $this->putJson("/api/tasks/{$taskId}/complete")->assertOk()->assertJsonPath('task.status', 'completed');

        $this->assertDatabaseHas('tasks', ['id' => $taskId, 'status' => 'completed']);
    }

    public function test_developer_cannot_create_or_delete_tasks(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $developer = User::factory()->create(['role' => 'developer']);
        $project = Project::create(['name' => 'Portail', 'manager_id' => $manager->id]);
        $task = Task::create([
            'title' => 'Tâche protégée',
            'project_id' => $project->id,
            'created_by' => $manager->id,
        ]);

        Sanctum::actingAs($developer);
        $this->postJson('/api/tasks', ['title' => 'Interdite', 'project_id' => $project->id])->assertForbidden();
        $this->deleteJson("/api/tasks/{$task->id}")->assertForbidden();
    }
}
