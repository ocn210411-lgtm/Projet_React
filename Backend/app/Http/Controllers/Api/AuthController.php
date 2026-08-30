<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{

    /**
     * Connexion
     */
    public function login(Request $request)
    {

        $request->validate([

            'email'=>'required|email',

            'password'=>'required'

        ]);


        $user = User::where(
            'email',
            $request->email
        )->first();


        if(!$user)
        {
            return response()->json([
                'message'=>'Utilisateur introuvable'
            ],404);
        }


        if(!$user->is_active)
        {
            return response()->json([
                'message'=>'Compte désactivé'
            ],403);
        }


        if(!Hash::check(
            $request->password,
            $user->password
        ))
        {
            return response()->json([
                'message'=>'Mot de passe incorrect'
            ],401);
        }



        $token = $user->createToken(
            'api-token'
        )->plainTextToken;



        return response()->json([

            'message'=>'Connexion réussie',

            'token'=>$token,

            'must_change_password'=>$user->must_change_password,

            'user'=>[
                'id'=>$user->id,
                'name'=>$user->name,
                'email'=>$user->email,
                'role'=>$user->role
            ]

        ]);

    }



    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {

        $request->user()
                ->currentAccessToken()
                ->delete();


        return response()->json([

            'message'=>'Déconnexion réussie'

        ]);

    }



    /**
     * Changer mot de passe
     */
    public function changePassword(Request $request)
    {

        $request->validate([

            'old_password'=>'required',

            'password'=>'required|min:8|confirmed'

        ]);

        $user=$request->user();

        if(!Hash::check(
            $request->old_password,
            $user->password
        ))
        {

            return response()->json([

                'message'=>'Ancien mot de passe incorrect'

            ],401);

        }



        $user->update([

            'password'=>Hash::make(
                $request->password
            ),

            'must_change_password'=>false

        ]);



        return response()->json([

            'message'=>'Mot de passe modifié'

        ]);

    }

}