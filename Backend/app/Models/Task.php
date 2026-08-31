<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{

    protected $fillable = [

        'title',
        'description',
        'project_id',
        'created_by',
        'assigned_to',
        'status',
        'assigned_at',
        'start_date'

    ];



    // Projet
    public function project()
    {
        return $this->belongsTo(Project::class);
    }



    // Créateur
    public function creator()
    {
        return $this->belongsTo(User::class,'created_by');
    }



    // Développeur assigné
    public function developer()
    {
        return $this->belongsTo(User::class,'assigned_to');
    }



    // Branches Github créées à partir de la tâche
    public function githubBranches()
    {
        return $this->hasMany(GithubBranch::class);
    }

}