<?php

namespace Database\Factories;

use App\Models\Job;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobFactory extends Factory
{
    protected $model = Job::class;

    public function definition()
    {
        return [
            'title' => $this->faker->jobTitle,
            'company' => $this->faker->company,
            'location' => $this->faker->city,
            'salary' => $this->faker->numberBetween(10000, 50000),
            'type' => $this->faker->randomElement(['Part-time', 'Permanent', 'Internship']),
            'description' => $this->faker->paragraph,
            'employer_id' => \App\Models\User::factory(),
        ];
    }
}
