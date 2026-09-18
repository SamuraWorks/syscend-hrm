<?php

namespace Modules\Admin\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingController extends Controller
{
    public function index()
    {
        $settings = Setting::getMany([
            'recaptcha_enabled',
            'recaptcha_site_key',
            'recaptcha_secret_key',
        ]);

        return Inertia::render('admin/Settings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'recaptcha_enabled' => 'boolean',
            'recaptcha_site_key' => 'nullable|string|max:200',
            'recaptcha_secret_key' => 'nullable|string|max:200',
        ]);

        foreach ($data as $key => $value) {
            Setting::set($key, $value === null ? null : (string) $value);
        }

        return back()->with('success', 'Settings saved.');
    }
}
