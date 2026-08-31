<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ManagerSeeder extends Seeder
{
    public function run(): void
    {
        User::create([

            'name' => 'Manager',

            'email' => 'manager@orbittask.local',

            'password' => Hash::make('password'),

            'role' => 'manager',

            'is_active' => true,

            'must_change_password' => true

        ]);
    }
}
