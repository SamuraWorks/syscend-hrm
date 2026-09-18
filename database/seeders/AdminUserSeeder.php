<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Super Admin',         'email' => 'admin@syscendhrm.test',      'role' => 'Admin'],
            ['name' => 'HR Manager',          'email' => 'hr@syscendhrm.test',         'role' => 'HR Manager'],
            ['name' => 'Department Manager',  'email' => 'manager@syscendhrm.test',    'role' => 'Manager'],
            ['name' => 'John Employee',       'email' => 'employee@syscendhrm.test',   'role' => 'Employee'],
            ['name' => 'Recruiter',           'email' => 'recruiter@syscendhrm.test',  'role' => 'Recruiter'],
            ['name' => 'Finance Manager',     'email' => 'finance@syscendhrm.test',    'role' => 'Finance'],
        ];

        foreach ($users as ['name' => $name, 'email' => $email, 'role' => $role]) {
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('Admin@1234'),
                ]
            );
            $user->assignRole($role);
        }
    }
}
