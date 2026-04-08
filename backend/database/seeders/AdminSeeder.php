<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a default admin user if it doesn't exist
        $admin = User::where('email', 'admin@campusjob.com')->first();

        if (!$admin) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@campusjob.com',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_blocked' => false,
            ]);

            $this->command->info('Admin user created successfully!');
            $this->command->info('Email: admin@campusjob.com');
            $this->command->info('Password: admin123');
        } else {
            $this->command->info('Admin user already exists!');
        }
    }
}
