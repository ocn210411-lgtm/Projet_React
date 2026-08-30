<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{

    // ==========================
    // Liste des utilisateurs
    // ==========================
    public function index()
    {
        return response()->json([
            'users' => User::all()
        ]);
    }


    // ==========================
    // Créer un utilisateur
    // ==========================
    public function store(Request $request)
    {

        $request->validate([

            'name' => 'required|string|max:255',

            'email' => 'required|email|unique:users,email',

            'password' => 'required|min:8',

            'role' => 'required|in:lead_developer,developer'

        ]);


        $user = User::create([

            'name' => $request->name,

            'email' => $request->email,

            'password' => Hash::make($request->password),

            'role' => $request->role,

            'is_active' => true,

            'must_change_password' => true

        ]);


        return response()->json([

            'message' => 'Utilisateur créé avec succès',

            'user' => $user

        ], 201);

    }


    // ==========================
    // Afficher un utilisateur
    // ==========================
    public function show(User $user)
    {

        return response()->json([

            'user' => $user

        ]);

    }


    // ==========================
    // Modifier un utilisateur
    // ==========================
    public function update(Request $request, User $user)
    {

        $request->validate([

            'name' => 'sometimes|string|max:255',

            'email' => [
                'sometimes',
                'email',
                Rule::unique('users')->ignore($user->id)
            ],

            'role' => 'sometimes|in:lead_developer,developer',

            'password' => 'sometimes|min:8'

        ]);


        $data = $request->only([
            'name',
            'email',
            'role'
        ]);


        if ($request->filled('password')) {

            $data['password'] = Hash::make($request->password);

        }


        $user->update($data);


        return response()->json([

            'message' => 'Utilisateur modifié avec succès',

            'user' => $user

        ]);

    }


    // ==========================
    // Désactiver
    // ==========================
    public function disable(User $user)
    {

        $user->update([

            'is_active' => false

        ]);


        return response()->json([

            'message' => 'Utilisateur désactivé'

        ]);

    }


    // ==========================
    // Activer
    // ==========================
    public function enable(User $user)
    {

        $user->update([

            'is_active' => true

        ]);


        return response()->json([

            'message' => 'Utilisateur activé'

        ]);

    }


    // ==========================
    // Supprimer
    // ==========================
    public function destroy(User $user)
    {

        if ($user->role === 'manager') {

            return response()->json([

                'message' => 'Le manager ne peut pas être supprimé'

            ], 403);

        }


        $user->delete();


        return response()->json([

            'message' => 'Utilisateur supprimé avec succès'

        ]);

    }

}