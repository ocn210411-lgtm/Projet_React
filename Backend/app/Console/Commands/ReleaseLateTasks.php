<?php

namespace App\Console\Commands;

use App\Models\Task;
use Illuminate\Console\Command;

class ReleaseLateTasks extends Command
{
    protected $signature = 'tasks:release-late';

    protected $description = 'Libère les tâches assignées non démarrées 1 jour après leur date de démarrage prévue';

    public function handle(): int
    {
        $tasks = Task::where('status', 'assigned')
            ->whereNotNull('start_date')
            ->whereDate('start_date', '<=', now()->subDay()->toDateString())
            ->get();

        foreach ($tasks as $task) {
            $task->update([
                'assigned_to' => null,
                'assigned_at' => null,
                'status' => 'pending',
            ]);
        }

        $this->info("{$tasks->count()} tâche(s) libérée(s).");

        return self::SUCCESS;
    }
}
