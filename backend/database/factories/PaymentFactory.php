<?php

namespace Database\Factories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition()
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            'description' => $this->faker->sentence,
            'status' => $this->faker->randomElement(['Success', 'Pending', 'Failed']),
            'payment_method' => $this->faker->randomElement(['bKash', 'Nagad', 'Stripe', 'PayPal']),
            'transaction_id' => $this->faker->uuid,
        ];
    }
}
