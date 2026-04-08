<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_payments_index_requires_authentication()
    {
        $response = $this->getJson('/api/payments');
        $response->assertStatus(401);
    }

    public function test_user_can_get_their_payments()
    {
        $user = User::factory()->create();
        Payment::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/payments');
        $response->assertStatus(200)
                 ->assertJsonCount(1);
    }
}
