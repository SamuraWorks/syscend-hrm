<?php

namespace Database\Factories;

use App\Models\LeaveType;
use Illuminate\Database\Eloquent\Factories\Factory;

class LeaveTypeFactory extends Factory
{
    protected $model = LeaveType::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'code' => strtoupper($this->faker->unique()->lexify('???')),
            'days_allowed' => 15,
            'is_paid' => true,
            'is_carry_forward' => false,
            'max_carry_forward' => 0,
            'allow_half_day' => true,
            'color' => '#3b82f6',
            'is_active' => true,
        ];
    }
}
