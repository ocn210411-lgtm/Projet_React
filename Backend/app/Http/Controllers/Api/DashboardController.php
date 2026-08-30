<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([

            'users' => User::count(),

            'projects' => Project::count(),

            'tasks' => Task::count(),

            'completed_tasks' => Task::where('status', 'completed')->count(),

            'pending_tasks' => Task::where('status', 'pending')->count(),

            'assigned_tasks' => Task::where('status', 'assigned')->count(),

            'in_progress_tasks' => Task::where('status', 'in_progress')->count(),

            'expired_tasks' => Task::where('status', 'expired')->count()

        ]);
    }
}