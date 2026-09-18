<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Commerce\app\Models\Product;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->company().' SKU',
            'description' => null,
            'category' => 'service',
            'type' => 'other',
            'price' => 0,
            'yearly_price' => null,
            'currency' => 'Le',
            'one_time' => true,
            'is_active' => true,
            'sort' => 0,
            'notes' => null,
        ];
    }

    public function license(float $price = 0, ?float $yearly = null): static
    {
        return $this->state(fn () => [
            'category' => 'license',
            'type' => 'license',
            'price' => $price,
            'yearly_price' => $yearly,
        ]);
    }
}
