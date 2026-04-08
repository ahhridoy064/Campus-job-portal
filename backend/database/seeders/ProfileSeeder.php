<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Profile;
use App\Models\User;

class ProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get a student user to associate profile with
        $studentUser = User::where('role', 'student')->first();

        if ($studentUser) {
            Profile::updateOrCreate(
                ['user_id' => $studentUser->id],
                [
                    'skills' => ['PHP', 'Laravel', 'React'],
                    'resume_url' => 'https://example.com/resume.pdf',
                    'description' => 'A motivated student with skills in web development and software engineering.',
                ]
            );
        }
    }
}
