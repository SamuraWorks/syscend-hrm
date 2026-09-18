<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Commerce\app\Models\Organization;

class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'short_name' => null,
            'industry' => $this->faker->word(),
            'country' => 'Sierra Leone',
            'website' => $this->faker->url(),
            'size' => '11-50',
            'contact_name' => $this->faker->name(),
            'contact_position' => 'Owner',
            'contact_email' => $this->faker->safeEmail(),
            'contact_phone' => '+23270000000',
            'email' => $this->faker->safeEmail(),
            'phone' => null,
            'address' => null,
            'primary_color' => '#2563eb',
        ];
    }
}
