<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Commerce\app\Models\PurchaseRequest;

class PurchaseRequestFactory extends Factory
{
    protected $model = PurchaseRequest::class;

    public function definition(): array
    {
        return [
            'reference' => PurchaseRequest::generateReference(),
            'organization_id' => OrganizationFactory::new(),
            'status' => 'awaiting_payment',
            'currency' => 'Le',
            'subtotal' => 0,
            'total' => 0,
        ];
    }

    public function status(string $status): static
    {
        return $this->state(fn () => ['status' => $status]);
    }
}
