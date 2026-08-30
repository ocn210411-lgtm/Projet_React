<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'must_change_password'
    ];

    protected $hidden = [
        'password',
        'remember_token'
    ];

    protected $casts = [
        'password' => 'hashed',
        'is_active' => 'boolean',
        'must_change_password' => 'boolean',
    ];

    // Projets créés par le manager
    public function managedProjects()
    {
        return $this->hasMany(Project::class, 'manager_id');
    }

    // Projets dirigés par le lead développeur
    public function leadProjects()
    {
        return $this->hasMany(Project::class, 'lead_developer_id');
    }

    // Projets auxquels appartient l'utilisateur
    public function projects()
    {
        return $this->belongsToMany(Project::class);
    }

    // Tâches créées
    public function createdTasks()
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    // Tâches assignées
    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function githubBranches()
    {
        return $this->hasMany(GithubBranch::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class,'assigned_to');
    }

    
}
