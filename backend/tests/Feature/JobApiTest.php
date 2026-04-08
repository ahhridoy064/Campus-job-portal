<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Job;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_jobs_index_is_public()
    {
        $response = $this->getJson('/api/jobs');
        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_get_jobs()
    {
        $user = User::factory()->create();
        Job::factory()->count(3)->create(['employer_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/jobs');
        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_employer_can_post_job()
    {
        $user = User::factory()->create(['role' => 'employer']);

        $jobData = [
            'title' => 'Software Engineer',
            'company' => 'Tech Corp',
            'location' => 'New York',
            'salary' => 50000,
            'type' => 'Permanent',
            'description' => 'A great job',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/jobs', $jobData);
        $response->assertStatus(201)
                 ->assertJson([
                     'title' => 'Software Engineer',
                     'company' => 'Tech Corp',
                     'employer_id' => $user->id,
                 ]);

        $this->assertDatabaseHas('jobs', [
            'title' => 'Software Engineer',
            'employer_id' => $user->id,
        ]);
    }

    public function test_non_employer_cannot_post_job()
    {
        $user = User::factory()->create(['role' => 'student']);

        $jobData = [
            'title' => 'Software Engineer',
            'company' => 'Tech Corp',
            'location' => 'New York',
            'salary' => 50000,
            'type' => 'Permanent',
            'description' => 'A great job',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/jobs', $jobData);
        $response->assertStatus(403);
    }
}
