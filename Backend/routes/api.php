<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;


/*
|--------------------------------------------------------------------------
| Routes publiques
|--------------------------------------------------------------------------
*/

Route::post('/login', [
    AuthController::class,
    'login'
]);



/*
|--------------------------------------------------------------------------
| Routes protégées par Sanctum
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {



    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [
        AuthController::class,
        'logout'
    ]);


    Route::post('/change-password', [
        AuthController::class,
        'changePassword'
    ]);





    /*
    |--------------------------------------------------------------------------
    | PROJECTS
    |--------------------------------------------------------------------------
    |
    | Accessible uniquement au manager
    |
    */

    Route::middleware('role:manager')->group(function () {
        Route::patch(
    '/projects/{project}/lead-developer',
    [ProjectController::class,'assignLeadDeveloper']
);


        /*
        | Gestion utilisateurs
        */

        Route::apiResource(
            'users',
            UserController::class
        );


        Route::patch(
            '/users/{user}/disable',
            [UserController::class,'disable']
        );


        Route::patch(
            '/users/{user}/enable',
            [UserController::class,'enable']
        );





        /*
        | Gestion projets
        */

        Route::apiResource(
            'projects',
            ProjectController::class
        );


        Route::post(
            '/projects/{project}/members',
            [ProjectController::class,'addMember']
        );


        Route::delete(
            '/projects/{project}/members/{user}',
            [ProjectController::class,'removeMember']
        );





        /*
        | Création des tâches
        */

        Route::post(
            '/tasks',
            [TaskController::class,'store']
        );


        /*
        | Assignation tâche
        */

        Route::put(
            '/tasks/{task}/assign',
            [TaskController::class,'assign']
        );


        /*
        | Modification tâche
        */

        Route::put(
            '/tasks/{task}',
            [TaskController::class,'update']
        );


        /*
        | Suppression tâche
        */

        Route::delete(
            '/tasks/{task}',
            [TaskController::class,'destroy']
        );


    });







    /*
    |--------------------------------------------------------------------------
    | TASKS
    |--------------------------------------------------------------------------
    */


    Route::get(
        '/tasks',
        [TaskController::class,'index']
    );


    Route::get(
        '/tasks/{task}',
        [TaskController::class,'show']
    );




    /*
    |--------------------------------------------------------------------------
    | Développeur récupère une tâche après 3 jours
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/tasks/{task}/take',
        [TaskController::class,'take']
    );





    /*
    |--------------------------------------------------------------------------
    | Démarrer une tâche
    |--------------------------------------------------------------------------
    */

    Route::put(
        '/tasks/{task}/start',
        [TaskController::class,'start']
    );





    /*
    |--------------------------------------------------------------------------
    | Terminer une tâche
    |--------------------------------------------------------------------------
    */

    Route::put(
        '/tasks/{task}/complete',
        [TaskController::class,'complete']
    );





    /*
    |--------------------------------------------------------------------------
    | Changer statut tâche
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:developer,lead_developer')
    ->group(function () {


        Route::put(
            '/tasks/{task}/status',
            [TaskController::class,'changeStatus']
        );


    });



});