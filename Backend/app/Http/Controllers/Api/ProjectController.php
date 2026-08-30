<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;


class ProjectController extends Controller
{


    /*
    |--------------------------------------------------------------------------
    | Liste des projets
    |--------------------------------------------------------------------------
    */

    public function index()
    {

        $projects = Project::with([

            'manager',
            'leadDeveloper',
            'members',
            'tasks'

        ])->get();


        return response()->json([

            "projects"=>$projects

        ]);

    }





    /*
    |--------------------------------------------------------------------------
    | Créer un projet
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {

        $request->validate([

            'name'=>'required|string',

            'description'=>'nullable|string',

            'lead_developer_id'=>'nullable|exists:users,id'

        ]);



        if ($request->filled('lead_developer_id')) {
            $isLead = User::whereKey($request->lead_developer_id)
                ->where('role', 'lead_developer')
                ->where('is_active', true)
                ->exists();

            if (! $isLead) {
                return response()->json([
                    'message' => 'Le responsable doit être un Lead Developer actif'
                ], 422);
            }
        }

        $project = Project::create([

            'name'=>$request->name,

            'description'=>$request->description,

            'manager_id'=>auth()->id(),

            'lead_developer_id'=>$request->lead_developer_id

        ]);



        return response()->json([

            "message"=>"Projet créé",

            "project"=>$project->load(['leadDeveloper', 'tasks'])

        ],201);

    }





    /*
    |--------------------------------------------------------------------------
    | Afficher un projet
    |--------------------------------------------------------------------------
    */

    public function show(Project $project)
    {

        return response()->json(

            $project->load([

                'manager',
                'leadDeveloper',
                'members',
                'tasks'

            ])

        );

    }





    /*
    |--------------------------------------------------------------------------
    | Modifier un projet
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, Project $project)
    {

        $request->validate([

            'name'=>'sometimes|string',

            'description'=>'sometimes|string'

        ]);



        $project->update(

            $request->only([

                'name',
                'description'

            ])

        );



        return response()->json([

            "message"=>"Projet modifié",

            "project"=>$project

        ]);

    }





    /*
    |--------------------------------------------------------------------------
    | Supprimer un projet
    |--------------------------------------------------------------------------
    */

    public function destroy(Project $project)
    {

        $project->delete();


        return response()->json([

            "message"=>"Projet supprimé"

        ]);

    }





    /*
    |--------------------------------------------------------------------------
    | Ajouter un membre
    |--------------------------------------------------------------------------
    */

    public function addMember(
        Request $request,
        Project $project
    )
    {

        $request->validate([

            'user_id'=>'required|exists:users,id'

        ]);



        if(
            $project->members()
            ->where('user_id',$request->user_id)
            ->exists()
        )
        {

            return response()->json([

                "message"=>"Utilisateur déjà membre du projet"

            ],400);

        }



        $project->members()->attach(

            $request->user_id

        );



        return response()->json([

            "message"=>"Utilisateur ajouté au projet",

            "members"=>$project->load('members')

        ]);

    }





    /*
    |--------------------------------------------------------------------------
    | Retirer un membre
    |--------------------------------------------------------------------------
    */

    public function removeMember(
        Project $project,
        User $user
    )
    {

        $project->members()->detach(

            $user->id

        );


        return response()->json([

            "message"=>"Utilisateur retiré du projet"

        ]);

    }





    /*
    |--------------------------------------------------------------------------
    | Affecter un Lead Developer
    |--------------------------------------------------------------------------
    */

    public function assignLeadDeveloper(
        Request $request,
        Project $project
    )
    {

        $request->validate([

            'lead_developer_id'=>'required|exists:users,id'

        ]);



        $developer = User::find(

            $request->lead_developer_id

        );



        if($developer->role !== 'lead_developer')
        {

            return response()->json([

                "message"=>"Cet utilisateur n'est pas un Lead Developer"

            ],403);

        }



        $project->update([

            'lead_developer_id'=>$developer->id

        ]);



        return response()->json([

            "message"=>"Lead Developer affecté au projet",

            "project"=>$project->load(
                'leadDeveloper'
            )

        ]);

    }



}
