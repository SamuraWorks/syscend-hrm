<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Modules\SystemAdmin\app\Models\SystemSetting;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'notifications' => fn () => $request->user()
                ? $request->user()->unreadNotifications->take(15)->map(fn ($n) => [
                    'id' => $n->id,
                    'title' => $n->data['title'] ?? 'Notification',
                    'message' => $n->data['message'] ?? '',
                    'url' => $n->data['url'] ?? null,
                    'created_at' => $n->created_at->diffForHumans(),
                ])->values()
                : [],
            'unread_count' => fn () => $request->user()
                ? $request->user()->unreadNotifications()->count()
                : 0,
            'app_settings' => function () {
                return [
                    'app_name' => SystemSetting::get('app_name', 'Syscend-HRM'),
                    'primary_color' => SystemSetting::get('primary_color', '#2563eb'),
                    'secondary_color' => SystemSetting::get('secondary_color', ''),
                    'login_welcome' => SystemSetting::get('login_welcome', ''),
                    'footer_copyright' => SystemSetting::get('footer_copyright', '© '.date('Y').' Syscend-HRM. All rights reserved.'),
                    'logo_path' => SystemSetting::get('logo_path'),
                    'favicon_path' => SystemSetting::get('favicon_path'),
                    'mode' => config('app.mode', 'demo'),
                ];
            },
            'commerce' => function () {
                return [
                    'currency' => SystemSetting::get('commerce_currency', 'Le'),
                    'payment_note' => SystemSetting::get(
                        'commerce_payment_note',
                        'Payment instructions will be provided after your purchase request is reviewed.'
                    ),
                    'sales_email' => SystemSetting::get('commerce_sales_email', 'syscend@gmail.com'),
                    'sales_phone' => SystemSetting::get('commerce_sales_phone', '+23279630777'),
                ];
            },
        ];
    }
}
