<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{

    protected $fillable = [

        'name',
        'description',
        'manager_id',
        'lead_developer_id'

    ];



    public function manager()
    {
        return $this->belongsTo(
            User::class,
            'manager_id'
        );
    }



    public function leadDeveloper()
    {
        return $this->belongsTo(
            User::class,
            'lead_developer_id'
        );
    }



    public function members()
    {
        return $this->belongsToMany(
            User::class,
            'project_user'
        );
    }



    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

}