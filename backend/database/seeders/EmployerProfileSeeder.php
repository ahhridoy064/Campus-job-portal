<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EmployerProfile;
use App\Models\User;

class EmployerProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get employer users to associate profiles with
        $employerUsers = User::where('role', 'employer')->get();

        foreach ($employerUsers as $employer) {
            EmployerProfile::updateOrCreate(
                ['user_id' => $employer->id],
                [
                    'company_name' => $this->getCompanyName($employer->name),
                    'industry' => $this->getRandomIndustry(),
                    'website' => 'https://' . strtolower(str_replace(' ', '', $this->getCompanyName($employer->name))) . '.com',
                    'description' => 'A leading company in the ' . $this->getRandomIndustry() . ' industry, committed to innovation and excellence.',
                    'company_logo' => 'https://example.com/logo.png',
                ]
            );
        }
    }

    private function getCompanyName($userName)
    {
        $companies = [
            'john@example.com' => 'Tech Solutions Inc.',
            'jane@example.com' => 'Global Marketing Group',
        ];

        return $companies[$userName] ?? 'Sample Company';
    }

    private function getRandomIndustry()
    {
        $industries = ['Technology', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Manufacturing'];
        return $industries[array_rand($industries)];
    }
}
