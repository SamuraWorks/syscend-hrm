<?php

namespace Modules\SystemAdmin\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\LicenseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Modules\SystemAdmin\app\Models\AuditLog;
use Modules\SystemAdmin\app\Models\SystemSetting;

class SystemSettingsController extends Controller
{
    private const SETTING_KEYS = [
        // General
        'org_name',
        'org_email',
        'org_phone',
        'org_address',
        // Payroll
        'financial_year_start',
        // Regional
        'timezone',
        'date_format',
        'currency',
        'currency_symbol',
        // Appearance
        'app_name',
        'primary_color',
        'footer_copyright',
        'logo_path',
        'favicon_path',
        // Email
        'mail_mailer',
        'mail_host',
        'mail_port',
        'mail_username',
        'mail_password',
        'mail_encryption',
        'mail_from_address',
        'mail_from_name',
        // SMS
        'sms_provider',
        'sms_api_key',
        'sms_api_secret',
        'sms_from',
        'sms_enabled',
    ];

    public function index(): Response
    {
        $settings = SystemSetting::whereIn('key', self::SETTING_KEYS)
            ->pluck('value', 'key')
            ->all();

        // Provide defaults for missing keys
        $defaults = [
            // General
            'org_name' => 'Syscend-HRM',
            'org_email' => 'hr@syscendhrm.test',
            'org_phone' => '',
            'org_address' => '',
            // Payroll
            'financial_year_start' => '1',
            // Regional
            'timezone' => 'UTC',
            'date_format' => 'Y-m-d',
            'currency' => 'SLL',
            'currency_symbol' => 'Le',
            // Appearance
            'app_name' => 'Syscend-HRM',
            'primary_color' => '#2563eb',
            'footer_copyright' => '© '.date('Y').' Syscend-HRM. All rights reserved.',
            'logo_path' => null,
            'favicon_path' => null,
            // Email
            'mail_mailer' => 'smtp',
            'mail_host' => '',
            'mail_port' => '587',
            'mail_username' => '',
            'mail_password' => '',
            'mail_encryption' => 'tls',
            'mail_from_address' => '',
            'mail_from_name' => 'Syscend-HRM',
            // SMS
            'sms_provider' => 'twilio',
            'sms_api_key' => '',
            'sms_api_secret' => '',
            'sms_from' => '',
            'sms_enabled' => '0',
        ];

        $settings = array_merge($defaults, $settings);

        $license = (new LicenseService)->status();

        return Inertia::render('admin/settings/Index', [
            'settings' => $settings,
            'license' => $license,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            // General
            'org_name' => 'nullable|string|max:200',
            'org_email' => 'nullable|email|max:200',
            'org_phone' => 'nullable|string|max:50',
            'org_address' => 'nullable|string|max:500',
            // Payroll
            'financial_year_start' => 'nullable|integer|min:1|max:12',
            // Regional
            'timezone' => 'nullable|string|max:100',
            'date_format' => 'nullable|string|max:50',
            'currency' => 'nullable|string|max:10',
            'currency_symbol' => 'nullable|string|max:10',
            // Appearance
            'app_name' => 'nullable|string|max:100',
            'primary_color' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'footer_copyright' => 'nullable|string|max:300',
            // Email
            'mail_mailer' => 'nullable|string|in:smtp,sendmail,log,array',
            'mail_host' => 'nullable|string|max:200',
            'mail_port' => 'nullable|integer',
            'mail_username' => 'nullable|string|max:200',
            'mail_password' => 'nullable|string|max:200',
            'mail_encryption' => 'nullable|string|in:tls,ssl,starttls,null,',
            'mail_from_address' => 'nullable|email|max:200',
            'mail_from_name' => 'nullable|string|max:200',
            // SMS
            'sms_provider' => 'nullable|string|in:twilio,nexmo,vonage,africastalking,custom',
            'sms_api_key' => 'nullable|string|max:300',
            'sms_api_secret' => 'nullable|string|max:300',
            'sms_from' => 'nullable|string|max:50',
            'sms_enabled' => 'nullable|boolean',
        ]);

        foreach ($data as $key => $value) {
            SystemSetting::set($key, $value);
        }

        AuditLog::log('updated', 'Settings', 'System settings were updated.');

        return back()->with('success', 'Settings saved successfully.');
    }

    public function uploadLogo(Request $request)
    {
        $request->validate(['logo' => 'required|image|max:2048|mimes:png,jpg,jpeg,svg,webp']);
        $path = $request->file('logo')->store('branding', 'public');
        SystemSetting::set('logo_path', $path);
        AuditLog::log('updated', 'Settings', 'Organisation logo updated.');

        return back()->with('success', 'Logo uploaded successfully.');
    }

    public function testEmail(Request $request)
    {
        $request->validate(['test_email' => 'required|email']);
        try {
            // Temporarily set mail config from DB settings
            config([
                'mail.mailers.smtp.host' => SystemSetting::get('mail_host', config('mail.mailers.smtp.host')),
                'mail.mailers.smtp.port' => SystemSetting::get('mail_port', config('mail.mailers.smtp.port')),
                'mail.mailers.smtp.username' => SystemSetting::get('mail_username', ''),
                'mail.mailers.smtp.password' => SystemSetting::get('mail_password', ''),
                'mail.mailers.smtp.encryption' => SystemSetting::get('mail_encryption', 'tls'),
                'mail.from.address' => SystemSetting::get('mail_from_address', config('mail.from.address')),
                'mail.from.name' => SystemSetting::get('mail_from_name', config('mail.from.name')),
            ]);
            Mail::raw('This is a test email from Syscend-HRM.', function ($msg) use ($request) {
                $msg->to($request->test_email)->subject('Syscend-HRM — Test Email');
            });

            return back()->with('success', 'Test email sent to '.$request->test_email);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed: '.$e->getMessage());
        }
    }

    public function backupDatabase()
    {
        $dbName = config('database.connections.mysql.database', 'syscendhrm');
        $dbHost = config('database.connections.mysql.host', '127.0.0.1');
        $dbPort = config('database.connections.mysql.port', '3306');
        $dbUser = config('database.connections.mysql.username', 'root');
        $dbPass = config('database.connections.mysql.password', '');

        $filename = 'syscendhrm-backup-'.date('Y-m-d_His').'.sql';
        $tmpFile = storage_path('app/'.$filename);

        // Build mysqldump command
        $cmd = sprintf(
            'mysqldump --host=%s --port=%s --user=%s %s',
            escapeshellarg($dbHost),
            escapeshellarg($dbPort),
            escapeshellarg($dbUser),
            escapeshellarg($dbName),
        );
        if ($dbPass !== '') {
            $cmd = sprintf(
                'mysqldump --host=%s --port=%s --user=%s --password=%s %s',
                escapeshellarg($dbHost),
                escapeshellarg($dbPort),
                escapeshellarg($dbUser),
                escapeshellarg($dbPass),
                escapeshellarg($dbName),
            );
        }
        $cmd .= ' > '.escapeshellarg($tmpFile).' 2>&1';

        exec($cmd, $output, $exitCode);

        if ($exitCode !== 0 || ! file_exists($tmpFile) || filesize($tmpFile) === 0) {
            @unlink($tmpFile);
            $errorOutput = implode("\n", $output);
            AuditLog::log('failed', 'Settings', 'Database backup failed: '.$errorOutput);

            return back()->with('error', 'Backup failed. Ensure mysqldump is available in your PATH. Error: '.$errorOutput);
        }

        AuditLog::log('exported', 'Settings', 'Database backup downloaded: '.$filename);

        return response()->download($tmpFile, $filename, [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ])->deleteFileAfterSend(true);
    }
}
