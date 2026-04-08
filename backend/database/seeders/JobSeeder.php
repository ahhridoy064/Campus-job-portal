<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class JobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employer1 = \App\Models\User::firstOrCreate([
            'email' => 'john@example.com',
        ], [
            'name' => 'John Doe',
            'password' => bcrypt('password'),
            'role' => 'employer',
        ]);

        $employer2 = \App\Models\User::firstOrCreate([
            'email' => 'jane@example.com',
        ], [
            'name' => 'Jane Smith',
            'password' => bcrypt('password'),
            'role' => 'employer',
        ]);

        // Create sample jobs for categories in QUICK LINKS
        \App\Models\Job::create([
            'title' => 'Software Engineer Intern',
            'company' => 'Tech Corp',
            'location' => 'Dhaka University',
            'salary' => 15000,
            'type' => 'Internship',
            'description' => 'Develop web applications using React and Laravel.',
            'employer_id' => $employer1->id,
        ]);

        \App\Models\Job::create([
            'title' => 'Marketing Assistant',
            'company' => 'Marketing Inc',
            'location' => 'BUET Campus',
            'salary' => 12000,
            'type' => 'Part-time',
            'description' => 'Assist in marketing campaigns and social media management.',
            'employer_id' => $employer2->id,
        ]);

        \App\Models\Job::create([
            'title' => 'Research Assistant',
            'company' => 'University Research',
            'location' => 'NSU',
            'salary' => 18000,
            'type' => 'Permanent',
            'description' => 'Conduct research and assist professors in academic projects.',
            'employer_id' => $employer1->id,
        ]);

        \App\Models\Job::create([
            'title' => 'Campus Ambassador',
            'company' => 'Event Co',
            'location' => 'DU',
            'salary' => 10000,
            'type' => 'Part-time',
            'description' => 'Promote events and engage with students on campus.',
            'employer_id' => $employer2->id,
        ]);

        \App\Models\Job::create([
            'title' => 'Contractual Graphic Designer',
            'company' => 'Design Studio',
            'location' => 'Remote',
            'salary' => 20000,
            'type' => 'Part-time',
            'description' => 'Create graphics and branding materials for clients.',
            'employer_id' => $employer1->id,
        ]);

        \App\Models\Job::create([
            'title' => 'Overseas Sales Manager',
            'company' => 'Global Sales Ltd',
            'location' => 'Singapore',
            'salary' => 35000,
            'type' => 'Permanent',
            'description' => 'Manage sales operations in overseas markets.',
            'employer_id' => $employer2->id,
        ]);

        \App\Models\Job::create([
            'title' => 'Work From Home Customer Support',
            'company' => 'Support Hub',
            'location' => 'Remote',
            'salary' => 15000,
            'type' => 'Part-time',
            'description' => 'Provide customer support remotely.',
            'employer_id' => $employer1->id,
        ]);

        \App\Models\Job::create([
            'title' => 'Fresher Software Developer',
            'company' => 'Innovatech',
            'location' => 'Dhaka',
            'salary' => 18000,
            'type' => 'Permanent',
            'description' => 'Entry-level software developer position for fresh graduates.',
            'employer_id' => $employer2->id,
        ]);
    }
}
