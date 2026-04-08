<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;
use App\Models\User;

class TestPaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $student = User::where('email', 'student@test.com')->first();

        if ($student) {
            Payment::create([
                'user_id' => $student->id,
                'amount' => 100.00,
                'description' => 'Job Application Fee',
                'status' => 'success',
            ]);

            Payment::create([
                'user_id' => $student->id,
                'amount' => 50.00,
                'description' => 'Premium Job Access',
                'status' => 'pending',
            ]);

            $this->command->info('Test payments created for student user!');
        } else {
            $this->command->error('Student user not found!');
        }
    }
}