<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test student user
        User::create([
            'name' => 'Test Student',
            'email' => 'student@test.com',
            'password' => Hash::make('password'),
            'role' => 'student',
        ]);

        // Create test employer user
        User::create([
            'name' => 'Test Employer',
            'email' => 'employer@test.com',
            'password' => Hash::make('password'),
            'role' => 'employer',
        ]);

        // Create test admin user
        User::create([
            'name' => 'Test Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $this->command->info('Test users created successfully!');
        $this->command->info('Student: student@test.com / password');
        $this->command->info('Employer: employer@test.com / password');
        $this->command->info('Admin: admin@test.com / password');
    }
}