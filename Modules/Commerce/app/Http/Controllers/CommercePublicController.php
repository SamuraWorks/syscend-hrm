<?php

namespace Modules\Commerce\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Commerce\app\Models\License;
use Modules\Commerce\app\Models\Organization;
use Modules\Commerce\app\Models\Product;
use Modules\Commerce\app\Models\PurchaseRequest;
use Modules\Commerce\app\Models\PurchaseRequestItem;
use Modules\SystemAdmin\app\Models\SystemSetting;

class CommercePublicController extends Controller
{
    /** Visible, active catalogue sorted license-first. */
    private function catalogue(): Collection
    {
        return Product::where('is_active', true)
            ->orderByRaw("CASE category WHEN 'license' THEN 0 WHEN 'service' THEN 1 ELSE 2 END")
            ->orderBy('sort')
            ->get()
            ->map(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'category' => $p->category,
                'type' => $p->type,
                'price' => (float) $p->price,
                'yearly_price' => $p->yearly_price !== null ? (float) $p->yearly_price : null,
                'currency' => $p->currency,
                'one_time' => (bool) $p->one_time,
            ]);
    }

    public function pricing(): Response
    {
        return Inertia::render('commerce/Pricing', [
            'products' => $this->catalogue()->values(),
        ]);
    }

    public function features(): Response
    {
        return Inertia::render('commerce/Features');
    }

    public function howItWorks(): Response
    {
        return Inertia::render('commerce/HowItWorks');
    }

    public function contact(): Response
    {
        return Inertia::render('commerce/Contact');
    }

    public function purchase(): Response
    {
        return Inertia::render('commerce/Purchase', [
            'products' => $this->catalogue()->values(),
            'maxQty' => 99,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.qty' => 'required|integer|min:1|max:99',
            'items.*.term' => 'nullable|in:one-time,yearly',
            'organization.name' => 'required|string|max:255',
            'organization.short_name' => 'nullable|string|max:80',
            'organization.industry' => 'nullable|string|max:150',
            'organization.country' => 'nullable|string|max:120',
            'organization.size' => 'required|string|max:50',
            'organization.contact_name' => 'required|string|max:255',
            'organization.contact_position' => 'nullable|string|max:150',
            'organization.contact_email' => 'required|email',
            'organization.contact_phone' => 'nullable|string|max:50',
            'organization.email' => 'nullable|email',
            'organization.phone' => 'nullable|string|max:50',
            'organization.address' => 'nullable|string|max:1000',
            'organization.website' => 'nullable|string|max:255',
            'branding.primary_color' => 'nullable|string|max:20',
            'branding.secondary_color' => 'nullable|string|max:20',
            'branding.login_background' => 'nullable|string|max:20',
            'branding.login_welcome' => 'nullable|string|max:255',
            'branding.footer_copyright' => 'nullable|string|max:255',
        ]);

        // Re-fetch products server-side and snapshot prices (never trust client prices).
        $lineItems = [];
        $subtotal = 0.0;

        foreach ($validated['items'] as $line) {
            $product = Product::where('is_active', true)->findOrFail($line['product_id']);
            $term = $line['term'] ?? 'one-time';

            if ($term === 'yearly' && $product->yearly_price === null) {
                return back()->withErrors(['items' => "Product '{$product->name}' is only sold with a one-time license."])->withInput();
            }

            $unitPrice = $term === 'yearly' ? (float) $product->yearly_price : (float) $product->price;
            $price = $unitPrice * (int) $line['qty'];
            $subtotal += $price;

            $lineItems[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'category' => $product->category,
                'unit_price' => $unitPrice,
                'qty' => (int) $line['qty'],
                'line_total' => $price,
                'term' => $term,
                'period_months' => $term === 'yearly' ? 12 : null,
            ];
        }

        $org = Organization::create([
            'name' => $validated['organization']['name'],
            'short_name' => $validated['organization']['short_name'] ?? null,
            'industry' => $validated['organization']['industry'] ?? null,
            'country' => $validated['organization']['country'] ?? null,
            'website' => $validated['organization']['website'] ?? null,
            'size' => $validated['organization']['size'],
            'contact_name' => $validated['organization']['contact_name'],
            'contact_position' => $validated['organization']['contact_position'] ?? null,
            'contact_email' => $validated['organization']['contact_email'],
            'contact_phone' => $validated['organization']['contact_phone'] ?? null,
            'email' => $validated['organization']['email'] ?? $validated['organization']['contact_email'],
            'phone' => $validated['organization']['phone'] ?? null,
            'address' => $validated['organization']['address'] ?? null,

            'primary_color' => $validated['branding']['primary_color'] ?? '#2563eb',
            'secondary_color' => $validated['branding']['secondary_color'] ?? null,
            'login_background' => $validated['branding']['login_background'] ?? null,
            'login_welcome' => $validated['branding']['login_welcome'] ?? null,
            'footer_copyright' => $validated['branding']['footer_copyright'] ?? null,
        ]);

        $requestRecord = PurchaseRequest::create([
            'reference' => PurchaseRequest::generateReference(),
            'organization_id' => $org->id,
            'status' => 'awaiting_payment',
            'currency' => SystemSetting::get('commerce_currency', 'Le'),
            'subtotal' => $subtotal,
            'total' => $subtotal,
            'submitted_at' => now(),
        ]);

        foreach ($lineItems as $item) {
            $requestRecord->items()->create($item);
        }

        return redirect()->route('commerce.purchase.status', $requestRecord->reference)
            ->with('success', 'Your purchase request was submitted. Our team will contact you shortly.');
    }

    public function status(string $reference): Response
    {
        $purchase = PurchaseRequest::with(['organization', 'items'])
            ->where('reference', $reference)
            ->firstOrFail();

        $steps = collect(PurchaseRequest::TIMELINE)->map(function (string $label, string $status) use ($purchase) {
            $position = $purchase->timelinePosition();

            return [
                'status' => $status,
                'label' => $label,
                'current' => $purchase->status === $status,
                'done' => $position >= array_search($status, array_keys(PurchaseRequest::TIMELINE), true),
            ];
        })->values();

        return Inertia::render('commerce/Status', [
            'purchase' => [
                'reference' => $purchase->reference,
                'status' => $purchase->status,
                'status_label' => ucwords(str_replace('_', ' ', $purchase->status)),
                'currency' => $purchase->currency,
                'total' => (float) $purchase->total,
                'submitted_at' => $purchase->submitted_at?->toDayDateTimeString(),
                'payment_note' => $purchase->payment_note,
                'organization' => [
                    'name' => $purchase->organization->name,
                    'contact' => $purchase->organization->contact_name,
                    'email' => $purchase->organization->contact_email,
                ],
                'items' => $purchase->items->map(fn (PurchaseRequestItem $i) => [
                    'name' => $i->product_name,
                    'category' => $i->category,
                    'qty' => $i->qty,
                    'unit_price' => (float) $i->unit_price,
                    'line_total' => (float) $i->line_total,
                    'term' => $i->term,
                    'period_months' => $i->period_months,
                ]),
            ],
            'steps' => $steps,
            'license' => $purchase->organization->licenses()->latest()->first() ? [
                'license_key' => $purchase->organization->licenses()->latest()->first()->license_key,
                'status' => $purchase->organization->licenses()->latest()->first()->status,
            ] : null,
        ]);
    }
}
