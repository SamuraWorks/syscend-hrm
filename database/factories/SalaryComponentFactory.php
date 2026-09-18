<?php

namespace Database\Factories;

use App\Models\SalaryComponent;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalaryComponentFactory extends Factory
{
    protected $model = SalaryComponent::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'code' => strtoupper($this->faker->unique()->lexify('????')),
            'type' => 'earning',
            'calculation_type' => 'fixed',
            'value' => 0,
            'is_taxable' => true,
            'is_active' => true,
        ];
    }

    public function earning(): static
    {
        return $this->state(fn () => ['type' => 'earning']);
    }

    public function deduction(): static
    {
        return $this->state(fn () => ['type' => 'deduction']);
    }

    public function tax(): static
    {
        return $this->state(fn () => ['type' => 'tax']);
    }

    public function fixed(float $value = 100): static
    {
        return $this->state(fn () => ['calculation_type' => 'fixed', 'value' => $value]);
    }

    public function percentOfBasic(float $value = 10): static
    {
        return $this->state(fn () => ['calculation_type' => 'percentage_of_basic', 'value' => $value]);
    }

    public function percentOfGross(float $value = 5): static
    {
        return $this->state(fn () => ['calculation_type' => 'percentage_of_gross', 'value' => $value]);
    }
}
