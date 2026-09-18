<?php

namespace Modules\Commerce\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Commerce\app\Models\Deployment;
use Modules\Commerce\app\Models\License;
use Modules\Commerce\app\Models\Organization;
use Modules\Commerce\app\Models\Product;
use Modules\Commerce\app\Models\PurchaseRequest;
use Modules\SystemAdmin\app\Models\SystemSetting;
use Spatie\Permission\Models\Role;

class SyscendController extends Controller
{
    /** Allowed purchase-request transitions: from => [action => to]. */
    private const TRANSITIONS = [
        'draft' => ['submit' => 'submitted'],
        'submitted' => ['awaiting-payment' => 'awaiting_payment', 'cancel' => 'cancelled'],
        'awaiting_payment' => ['confirm-payment' => 'payment_confirmed', 'cancel' => 'cancelled'],
        'payment_confirmed' => ['issue-license' => 'license_issued'],
        'license_issued' => ['start-configuration' => 'configuration'],
        'configuration' => ['start-deployment' => 'deployment'],
        'deployment' => ['finish-training' => 'training'],
        'training' => ['complete' => 'completed'],
    ];

    private function requestPayload(PurchaseRequest $r): array
    {
        $license = $r->organization->licenses()->latest()->first();
        $deployment = $r->organization->deployments()->latest()->first();

        return [
            'id' => $r->id,
            'reference' => $r->reference,
            'status' => $r->status,
            'status_label' => ucwords(str_replace('_', ' ', $r->status)),
            'currency' => $r->currency,
            'subtotal' => (float) $r->subtotal,
            'total' => (float) $r->total,
            'notes' => $r->notes,
            'submitted_at' => $r->submitted_at?->toDayDateTimeString(),
            'payment_confirmed_at' => $r->payment_confirmed_at?->toDayDateTimeString(),
            'created_at' => $r->created_at->toDayDateTimeString(),
            'organization' => [
                'id' => $r->organization->id,
                'name' => $r->organization->name,
                'contact' => $r->organization->contact_name,
                'email' => $r->organization->contact_email,
                'phone' => $r->organization->contact_phone,
                'country' => $r->organization->country,
            ],
            'items' => $r->items->map(fn ($i) => [
                'name' => $i->product_name,
                'category' => $i->category,
                'qty' => $i->qty,
                'unit_price' => (float) $i->unit_price,
                'line_total' => (float) $i->line_total,
                'term' => $i->term,
                'period_months' => $i->period_months,
            ]),
            'license' => $license ? [
                'id' => $license->id,
                'license_key' => $license->license_key,
                'status' => $license->status,
                'license_type' => $license->license_type,
                'expires_at' => $license->expires_at?->toDayDateTimeString(),
            ] : null,
            'deployment' => $deployment ? [
                'id' => $deployment->id,
                'status' => $deployment->status,
                'domain' => $deployment->domain,
            ] : null,
            'allowed_actions' => array_keys(self::TRANSITIONS[$r->status] ?? []),
            'timeline' => $this->timeline($r),
        ];
    }

    private function timeline(PurchaseRequest $r): array
    {
        $position = $r->timelinePosition();

        return collect(PurchaseRequest::TIMELINE)->map(function (string $label, string $status) use ($r, $position) {
            return [
                'status' => $status,
                'label' => $label,
                'current' => $r->status === $status,
                'done' => $position >= array_search($status, array_keys(PurchaseRequest::TIMELINE), true),
            ];
        })->values()->all();
    }

    // ─── Dashboard ────────────────────────────────────────────────────────────

    public function dashboard(): Response
    {
        $currency = (string) SystemSetting::get('commerce_currency', 'Le');

        $paidStatuses = ['payment_confirmed', 'license_issued', 'configuration', 'deployment', 'training', 'completed'];

        $stats = [
            'total_requests' => PurchaseRequest::where('status', '!=', 'cancelled')->count(),
            'awaiting_payment' => PurchaseRequest::where('status', 'awaiting_payment')->count(),
            'pending_revenue' => (float) PurchaseRequest::whereIn('status', ['awaiting_payment', 'payment_confirmed'])->sum('total'),
            'paid_revenue' => (float) PurchaseRequest::whereNotNull('paid_at')->sum('total'),
            'paid_requests' => (int) PurchaseRequest::whereNotNull('paid_at')->count(),
            'confirmed_revenue' => (float) PurchaseRequest::whereIn('status', $paidStatuses)->sum('total'),
            'organizations' => Organization::count(),
            'active_licenses' => License::where('status', 'active')->count(),
            'deployments' => Deployment::whereNotIn('status', ['deployed', 'failed'])->count(),
            'products' => Product::where('is_active', true)->count(),
            'total_users' => (int) User::count(),
            'active_users' => (int) User::where('is_active', true)->count(),
            'users_this_month' => (int) User::where('created_at', '>=', now()->startOfMonth())->count(),
        ];

        $usersByRole = User::with('roles')->get()
            ->groupBy(fn (User $u) => $u->roles->first()?->name ?? 'No role')
            ->map->count()
            ->sortDesc();

        $recent = PurchaseRequest::with('organization')
            ->latest()
            ->take(8)
            ->get()
            ->map(fn (PurchaseRequest $r) => $this->requestPayload($r));

        return Inertia::render('syscend/Dashboard', [
            'stats' => $stats,
            'currency' => $currency,
            'users_by_role' => $usersByRole,
            'recent' => $recent,
        ]);
    }

    // ─── Payments ─────────────────────────────────────────────────────────────

    public function payments(Request $request): Response
    {
        $currency = (string) SystemSetting::get('commerce_currency', 'Le');
        $query = PurchaseRequest::with('organization')->whereNotNull('paid_at')->latest('paid_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhereHas('organization', fn ($o) => $o->where('name', 'like', "%{$search}%"));
            });
        }

        $items = $query->paginate(15)->withQueryString();

        return Inertia::render('syscend/Payments', [
            'payments' => collect($items->items())->map(fn (PurchaseRequest $r) => [
                'id' => $r->id,
                'reference' => $r->reference,
                'status' => $r->status,
                'status_label' => ucwords(str_replace('_', ' ', $r->status)),
                'organization' => $r->organization->name,
                'contact_email' => $r->organization->contact_email,
                'contact_phone' => $r->organization->contact_phone,
                'total' => (float) $r->total,
                'currency' => $r->currency,
                'paid_at' => $r->paid_at?->toDayDateTimeString(),
                'payment_confirmed_at' => $r->payment_confirmed_at?->toDayDateTimeString(),
            ]),
            'summary' => [
                'total_paid' => (float) PurchaseRequest::whereNotNull('paid_at')->sum('total'),
                'paid_count' => (int) PurchaseRequest::whereNotNull('paid_at')->count(),
                'awaiting' => (int) PurchaseRequest::where('status', 'awaiting_payment')->count(),
                'currency' => $currency,
            ],
            'pagination' => [
                'current' => $items->currentPage(),
                'last' => $items->lastPage(),
                'total' => $items->total(),
                'per_page' => $items->perPage(),
                'records_start' => $items->firstItem() ?? 0,
                'records_end' => $items->lastItem() ?? 0,
            ],
            'filters' => [
                'status' => $request->query('status'),
                'search' => $request->query('search'),
            ],
        ]);
    }

    // ─── Portal users ─────────────────────────────────────────────────────────

    public function users(Request $request): Response
    {
        $query = User::with('roles')->latest();

        if ($role = $request->query('role')) {
            $query->role($role);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $items = $query->paginate(15)->withQueryString();

        return Inertia::render('syscend/Users', [
            'users' => collect($items->items())->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'is_active' => (bool) $u->is_active,
                'roles' => $u->roles->pluck('name')->values(),
                'last_login_at' => $u->last_login_at?->toDayDateTimeString(),
                'created_at' => $u->created_at->toDayDateTimeString(),
            ]),
            'roles' => Role::orderBy('name')->pluck('name')->values(),
            'pagination' => [
                'current' => $items->currentPage(),
                'last' => $items->lastPage(),
                'total' => $items->total(),
                'per_page' => $items->perPage(),
                'records_start' => $items->firstItem() ?? 0,
                'records_end' => $items->lastItem() ?? 0,
            ],
            'filters' => [
                'role' => $request->query('role'),
                'search' => $request->query('search'),
            ],
        ]);
    }

    // ─── Purchase requests ────────────────────────────────────────────────────

    public function requests(Request $request): Response
    {
        $query = PurchaseRequest::with('organization')->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhereHas('organization', fn ($o) => $o->where('name', 'like', "%{$search}%"));
            });
        }

        $items = $query->paginate(15)->withQueryString();

        return Inertia::render('syscend/Requests', [
            'requests' => collect($items->items())->map(fn (PurchaseRequest $r) => $this->requestPayload($r)),
            'pagination' => [
                'current' => $items->currentPage(),
                'last' => $items->lastPage(),
                'total' => $items->total(),
                'per_page' => $items->perPage(),
                'records_start' => $items->firstItem() ?? 0,
                'records_end' => $items->lastItem() ?? 0,
            ],
            'filters' => [
                'status' => $request->query('status'),
                'search' => $request->query('search'),
            ],
        ]);
    }

    public function requestShow(PurchaseRequest $purchaseRequest): Response
    {
        $purchaseRequest->load(['items', 'organization']);

        return Inertia::render('syscend/RequestShow', [
            'request' => $this->requestPayload($purchaseRequest),
        ]);
    }

    public function requestAction(PurchaseRequest $purchaseRequest, string $action): RedirectResponse
    {
        $current = $purchaseRequest->status;
        $next = self::TRANSITIONS[$current][$action] ?? null;

        if (! $next) {
            return back()->withErrors(['action' => "Action '{$action}' is not allowed for status '{$current}'."]);
        }

        DB::transaction(function () use ($purchaseRequest, $next) {
            $payload = [];

            if ($next === 'payment_confirmed') {
                $payload['payment_confirmed_at'] = now();
                $payload['paid_at'] = now();
            }

            if ($next === 'license_issued') {
                $licenseTerm = (string) ($purchaseRequest->items()
                    ->where('category', 'license')
                    ->value('term') ?? 'one-time');

                $license = License::create([
                    'license_key' => License::generateKey(),
                    'organization_id' => $purchaseRequest->organization_id,
                    'license_type' => $licenseTerm === 'yearly' ? 'yearly' : 'one-time',
                    'status' => 'active',
                    'issued_at' => now(),
                    'expires_at' => $licenseTerm === 'yearly' ? now()->addYear() : null,
                    'product' => 'Syscend-HRM',
                ]);

                Deployment::create([
                    'organization_id' => $purchaseRequest->organization_id,
                    'license_id' => $license->id,
                    'status' => 'queued',
                    'steps' => collect(Deployment::DEFAULT_STEPS)->map(fn ($label) => [
                        'label' => $label,
                        'done' => false,
                    ])->values()->all(),
                ]);
            }

            $payload['status'] = $next;
            $purchaseRequest->update($payload);
        });

        return back()->with('success', "Request {$purchaseRequest->reference} moved to '".ucwords(str_replace('_', ' ', $next))."'.");
    }

    // ─── Organizations ────────────────────────────────────────────────────────

    public function organizations(Request $request): Response
    {
        $query = Organization::withCount(['purchaseRequests', 'licenses'])->latest();

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $items = $query->paginate(15);

        return Inertia::render('syscend/Organizations', [
            'organizations' => collect($items->items())->map(fn (Organization $o) => [
                'id' => $o->id,
                'name' => $o->name,
                'country' => $o->country,
                'size' => $o->size,
                'contact' => $o->contact_name,
                'email' => $o->contact_email,
                'requests_count' => $o->purchase_requests_count,
                'licenses_count' => $o->licenses_count,
            ]),
            'pagination' => [
                'current' => $items->currentPage(),
                'last' => $items->lastPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    // ─── Licenses ─────────────────────────────────────────────────────────────

    public function licenses(Request $request): Response
    {
        $items = License::with('organization')->latest()->paginate(15);

        return Inertia::render('syscend/Licenses', [
            'licenses' => collect($items->items())->map(fn (License $l) => [
                'id' => $l->id,
                'license_key' => $l->license_key,
                'organization' => $l->organization->name,
                'license_type' => $l->license_type,
                'status' => $l->status,
                'issued_at' => $l->issued_at?->toDayDateTimeString(),
                'expires_at' => $l->expires_at?->toDayDateTimeString(),
                'product' => $l->product,
            ]),
            'pagination' => [
                'current' => $items->currentPage(),
                'last' => $items->lastPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function licenseAction(License $license, string $action): RedirectResponse
    {
        if ($action === 'extend') {
            if ($license->license_type !== 'yearly') {
                return back()->withErrors(['action' => 'Only yearly licenses can be extended.']);
            }

            $license->update([
                'expires_at' => now()->addYear(),
                'status' => 'active',
            ]);

            return back()->with('success', "License {$license->license_key} extended by 1 year.");
        }

        $allowed = [
            'suspend' => 'suspended',
            'activate' => 'active',
            'revoke' => 'revoked',
        ];

        if (! isset($allowed[$action])) {
            return back()->withErrors(['action' => "Unknown license action '{$action}'."]);
        }

        if (in_array($action, ['suspend', 'activate']) && $license->status === $allowed[$action]) {
            return back()->withErrors(['action' => "License is already {$allowed[$action]}."]);
        }

        $license->update(['status' => $allowed[$action]]);

        return back()->with('success', "License {$license->license_key} is now '{$allowed[$action]}'.");
    }

    // ─── Deployments ──────────────────────────────────────────────────────────

    public function deployments(): Response
    {
        $items = Deployment::with('organization')->latest()->paginate(15);

        return Inertia::render('syscend/Deployments', [
            'deployments' => collect($items->items())->map(fn (Deployment $d) => [
                'id' => $d->id,
                'organization' => $d->organization->name,
                'status' => $d->status,
                'domain' => $d->domain,
                'ssl' => (bool) $d->ssl,
                'steps' => $d->steps ?? [],
                'steps_done' => collect($d->steps ?? [])->where('done', true)->count(),
                'steps_total' => count($d->steps ?? []),
                'notes' => $d->notes,
            ]),
            'pagination' => [
                'current' => $items->currentPage(),
                'last' => $items->lastPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function deploymentSteps(Deployment $deployment, Request $request): RedirectResponse
    {
        $request->validate([
            'index' => 'required|integer|min:0',
        ]);

        $steps = $deployment->steps ?? [];
        $index = (int) $request->input('index');

        if (! isset($steps[$index])) {
            return back()->withErrors(['steps' => 'Invalid deployment step.']);
        }

        $steps[$index]['done'] = ! ($steps[$index]['done'] ?? false);

        $allDone = collect($steps)->every(fn ($step) => $step['done'] ?? false);
        $status = $allDone ? 'deployed' : (collect($steps)->contains(fn ($step) => $step['done'] ?? false) ? 'provisioning' : 'queued');

        $deployment->update(['steps' => array_values($steps), 'status' => $status]);

        return back()->with('success', $status === 'deployed' ? 'Deployment completed.' : 'Deployment step updated.');
    }

    // ─── Products / catalogue ─────────────────────────────────────────────────

    public function products(): Response
    {
        $catalogue = Product::orderByRaw("CASE category WHEN 'license' THEN 0 WHEN 'service' THEN 1 ELSE 2 END")->orderBy('sort')->get();

        return Inertia::render('syscend/Products', [
            'products' => $catalogue->map(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'category' => $p->category,
                'type' => $p->type,
                'price' => (float) $p->price,
                'yearly_price' => $p->yearly_price !== null ? (float) $p->yearly_price : null,
                'currency' => $p->currency,
                'one_time' => (bool) $p->one_time,
                'is_active' => (bool) $p->is_active,
                'sort' => $p->sort,
            ]),
        ]);
    }

    public function productStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:products,name',
            'description' => 'nullable|string|max:2000',
            'category' => 'required|in:license,service',
            'type' => 'required|in:license,deployment,training,onsite,migration,domain,custom,support,other',
            'price' => 'required|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:8',
            'is_active' => 'nullable|boolean',
        ]);

        Product::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'category' => $data['category'],
            'type' => $data['type'],
            'price' => $data['price'],
            'yearly_price' => array_key_exists('yearly_price', $data) && $data['yearly_price'] !== '' && $data['yearly_price'] !== null
                ? (float) $data['yearly_price']
                : null,
            'currency' => $data['currency'] ?? SystemSetting::get('commerce_currency', 'Le'),
            'one_time' => true,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', "Product '{$data['name']}' created.");
    }

    public function productUpdate(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:products,name,'.$product->id,
            'description' => 'nullable|string|max:2000',
            'category' => 'required|in:license,service',
            'type' => 'required|in:license,deployment,training,onsite,migration,domain,custom,support,other',
            'price' => 'required|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:8',
            'is_active' => 'nullable|boolean',
        ]);

        $product->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'category' => $data['category'],
            'type' => $data['type'],
            'price' => $data['price'],
            'yearly_price' => array_key_exists('yearly_price', $data) && $data['yearly_price'] !== '' && $data['yearly_price'] !== null
                ? (float) $data['yearly_price']
                : null,
            'currency' => $data['currency'] ?? $product->currency,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', "Product '{$data['name']}' updated.");
    }

    public function productToggle(Product $product): RedirectResponse
    {
        $product->update(['is_active' => ! $product->is_active]);

        return back()->with('success', $product->is_active ? "Product '{$product->name}' enabled." : "Product '{$product->name}' disabled.");
    }

    // ─── Settings ─────────────────────────────────────────────────────────────

    public function settings(): Response
    {
        return Inertia::render('syscend/Settings', [
            'settings' => [
                'currency' => SystemSetting::get('commerce_currency', 'Le'),
                'sales_email' => SystemSetting::get('commerce_sales_email', 'syscend@gmail.com'),
                'sales_phone' => SystemSetting::get('commerce_sales_phone', '+23279630777'),
                'payment_note' => SystemSetting::get('commerce_payment_note', 'Payment instructions will be provided after your purchase request is reviewed.'),
            ],
        ]);
    }

    public function settingsUpdate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'currency' => 'required|string|max:8',
            'sales_email' => 'required|email',
            'sales_phone' => 'nullable|string|max:50',
            'payment_note' => 'nullable|string|max:2000',
        ]);

        SystemSetting::set('commerce_currency', $data['currency']);
        SystemSetting::set('commerce_sales_email', $data['sales_email']);
        SystemSetting::set('commerce_sales_phone', $data['sales_phone'] ?? '');
        SystemSetting::set('commerce_payment_note', $data['payment_note'] ?? '');

        return back()->with('success', 'Sales settings updated.');
    }
}
