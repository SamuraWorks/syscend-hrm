<?php

namespace Database\Factories;

use App\Models\SalaryStructure;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalaryStructureFactory extends Factory
{
    protected $model = SalaryStructure::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->company().' Structure',
            'code' => strtoupper($this->faker->unique()->lexify('???')),
            'description' => null,
            'is_active' => true,
        ];
    }
}
