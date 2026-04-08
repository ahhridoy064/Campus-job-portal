<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Job;
use App\Models\Application;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApplicationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_applications_index_requires_authentication()
    {
        $response = $this->getJson('/api/applications');
        $response->assertStatus(401);
    }

    public function test_student_can_get_their_applications()
    {
        $student = User::factory()->create(['role' => 'student']);
        $job = Job::factory()->create();
        Application::factory()->create(['user_id' => $student->id, 'job_id' => $job->id]);

        $response = $this->actingAs($student, 'sanctum')->getJson('/api/applications');
        $response->assertStatus(200)
                 ->assertJsonCount(1);
    }

    public function test_employer_can_get_applications_for_their_jobs()
    {
        $employer = User::factory()->create(['role' => 'employer']);
        $job = Job::factory()->create(['employer_id' => $employer->id]);
        Application::factory()->create(['job_id' => $job->id]);

        $response = $this->actingAs($employer, 'sanctum')->getJson('/api/applications');
        $response->assertStatus(200)
                 ->assertJsonCount(1);
    }
}
