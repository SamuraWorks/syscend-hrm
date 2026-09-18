<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        return [
            'employee_id' => 'EMP-'.strtoupper($this->faker->unique()->lexify('????')),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'employment_status' => 'Active',
            'contract_type' => 'Permanent',
            'date_of_joining' => now()->subYears(2),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['employment_status' => 'Inactive']);
    }
}
