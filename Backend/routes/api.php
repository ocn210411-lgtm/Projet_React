<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\GithubController;


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
    | Lecture seule accessible à tous les utilisateurs connectés
    |--------------------------------------------------------------------------
    |
    | Nécessaire pour que le lead developer puisse choisir un projet/
    | développeur lors de la création d'une tâche
    |
    */

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);




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

        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);


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

        Route::post('/projects', [ProjectController::class, 'store']);
        Route::put('/projects/{project}', [ProjectController::class, 'update']);
        Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);


        Route::post(
            '/projects/{project}/members',
            [ProjectController::class,'addMember']
        );


        Route::delete(
            '/projects/{project}/members/{user}',
            [ProjectController::class,'removeMember']
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

    Route::middleware('role:manager,lead_developer')->group(function () {

        /*
        | Création des tâches (Lead Developer de son projet, ou Manager)
        */

        Route::post(
            '/tasks',
            [TaskController::class,'store']
        );


        /*
        | Assignation tâche (Lead Developer de son projet, ou Manager)
        */

        Route::put(
            '/tasks/{task}/assign',
            [TaskController::class,'assign']
        );

    });


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


        /*
        | Intégration Github : branches créées à partir d'une tâche
        */

        Route::get(
            '/tasks/{task}/github-branches',
            [GithubController::class,'index']
        );


        Route::post(
            '/tasks/{task}/github-branches',
            [GithubController::class,'createBranch']
        );


    });



});