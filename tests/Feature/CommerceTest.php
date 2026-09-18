<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Factories\ProductFactory;
use Database\Factories\PurchaseRequestFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Commerce\app\Models\License;
use Modules\Commerce\app\Models\PurchaseRequest;
use Modules\Commerce\app\Models\PurchaseRequestItem;
use Tests\TestCase;

class CommerceTest extends TestCase
{
    use RefreshDatabase;

    private function orgPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Acme Test Ltd',
            'short_name' => 'Acme',
            'industry' => 'Technology',
            'country' => 'Sierra Leone',
            'size' => '11-50',
            'contact_name' => 'Ada Okonkwo',
            'contact_position' => 'CEO',
            'contact_email' => 'ada@acme.test',
            'contact_phone' => '+23270000001',
            'email' => 'ada@acme.test',
            'website' => 'https://acme.test',
        ], $overrides);
    }

    public function test_public_purchase_snapshots_server_side_prices_for_yearly_term(): void
    {
        $product = ProductFactory::new()->license(500, 50)->create();

        $this->post('/get-started/submit', [
            'items' => [['product_id' => $product->id, 'qty' => 2, 'term' => 'yearly']],
            'organization' => $this->orgPayload(),
        ])->assertRedirect();

        $request = PurchaseRequest::firstOrFail();
        $this->assertSame('awaiting_payment', $request->status);
        $this->assertSame(100.0, (float) $request->subtotal);
        $this->assertSame(100.0, (float) $request->total);
        $this->assertSame('Le', $request->currency);
        $this->assertMatchesRegularExpression('/^SHRM-\d{4}-\d{4}$/', $request->reference);

        $item = PurchaseRequestItem::firstOrFail();
        $this->assertSame(50.0, (float) $item->unit_price);
        $this->assertSame(100.0, (float) $item->line_total);
        $this->assertSame('yearly', $item->term);
        $this->assertSame(12, $item->period_months);
        $this->assertSame('license', $item->category);
    }

    public function test_public_purchase_snapshots_one_time_price_and_null_period(): void
    {
        $product = ProductFactory::new()->license(500, 50)->create();

        $this->post('/get-started/submit', [
            'items' => [['product_id' => $product->id, 'qty' => 1, 'term' => 'one-time']],
            'organization' => $this->orgPayload(),
        ])->assertRedirect();

        $item = PurchaseRequestItem::firstOrFail();
        $this->assertSame(500.0, (float) $item->unit_price);
        $this->assertSame('one-time', $item->term);
        $this->assertNull($item->period_months);
    }

    public function test_yearly_term_is_rejected_when_product_has_no_yearly_price(): void
    {
        $product = ProductFactory::new()->license(500)->create(['yearly_price' => null]);

        $this->from('/get-started')->post('/get-started/submit', [
            'items' => [['product_id' => $product->id, 'qty' => 1, 'term' => 'yearly']],
            'organization' => $this->orgPayload(),
        ])->assertSessionHasErrors('items');

        $this->assertSame(0, PurchaseRequest::count());
    }

    private function syscendAdmin(): User
    {
        return $this->makeUser('ops@syscend.test', 'Syscend Admin');
    }

    private function confirmedRequest(string $term): PurchaseRequest
    {
        $product = ProductFactory::new()->license(500, 50)->create();
        $request = PurchaseRequestFactory::new()->status('payment_confirmed')->create([
            'subtotal' => $term === 'yearly' ? 50 : 500,
            'total' => $term === 'yearly' ? 50 : 500,
        ]);

        $request->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'category' => 'license',
            'unit_price' => $term === 'yearly' ? 50 : 500,
            'qty' => 1,
            'line_total' => $term === 'yearly' ? 50 : 500,
            'term' => $term,
            'period_months' => $term === 'yearly' ? 12 : null,
        ]);

        return $request;
    }

    public function test_issuing_a_yearly_license_sets_expiry_one_year_out(): void
    {
        $request = $this->confirmedRequest('yearly');

        $this->actingAs($this->syscendAdmin())
            ->from('/syscend/requests')
            ->post("/syscend/requests/{$request->id}/issue-license");

        $this->assertDatabaseHas('licenses', [
            'organization_id' => $request->organization_id,
            'license_type' => 'yearly',
            'status' => 'active',
        ]);

        $license = License::firstOrFail();
        $this->assertMatchesRegularExpression('/^SHRM-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/', $license->license_key);
        $this->assertNotNull($license->expires_at);
        $this->assertTrue($license->expires_at->gt(now()->addMonths(11)));

        $this->assertDatabaseHas('deployments', [
            'organization_id' => $request->organization_id,
            'license_id' => $license->id,
            'status' => 'queued',
        ]);

        $request->refresh();
        $this->assertSame('license_issued', $request->status);
    }

    public function test_issuing_a_one_time_license_has_no_expiry(): void
    {
        $request = $this->confirmedRequest('one-time');

        $this->actingAs($this->syscendAdmin())
            ->post("/syscend/requests/{$request->id}/issue-license");

        $this->assertDatabaseHas('licenses', [
            'organization_id' => $request->organization_id,
            'license_type' => 'one-time',
        ]);

        $license = License::firstOrFail();
        $this->assertNull($license->expires_at);
    }

    public function test_invalid_action_for_current_status_is_rejected(): void
    {
        $product = ProductFactory::new()->license(500, 50)->create();
        $request = PurchaseRequestFactory::new()->status('draft')->create();

        $request->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'category' => 'license',
            'unit_price' => 500,
            'qty' => 1,
            'line_total' => 500,
            'term' => 'one-time',
        ]);

        $this->actingAs($this->syscendAdmin())
            ->from('/syscend/requests')
            ->post("/syscend/requests/{$request->id}/issue-license")
            ->assertSessionHasErrors('action');

        $this->assertSame(0, License::count());
    }

    public function test_confirm_payment_moves_request_to_payment_confirmed(): void
    {
        $request = PurchaseRequestFactory::new()->status('awaiting_payment')->create();

        $this->actingAs($this->syscendAdmin())
            ->post("/syscend/requests/{$request->id}/confirm-payment");

        $request->refresh();
        $this->assertSame('payment_confirmed', $request->status);
        $this->assertNotNull($request->payment_confirmed_at);
        $this->assertNotNull($request->paid_at);
    }
}
