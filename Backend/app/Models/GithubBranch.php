<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GithubBranch extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'user_id',
        'branch_name',
        'github_url'
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}