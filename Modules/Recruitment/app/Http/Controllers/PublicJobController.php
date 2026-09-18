<?php

namespace Modules\Recruitment\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobPosting;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Modules\Recruitment\app\Notifications\NewJobApplication;

class PublicJobController extends Controller
{
    public function index()
    {
        $jobs = JobPosting::with('department')
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($j) => [
                'id' => $j->id,
                'title' => $j->title,
                'department' => $j->department?->name,
                'location' => $j->location,
                'type' => $j->type,
                'work_mode' => $j->work_mode,
                'salary_min' => $j->salary_min,
                'salary_max' => $j->salary_max,
                'deadline' => $j->deadline?->format('Y-m-d'),
                'created_at' => $j->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('careers/Index', compact('jobs'));
    }

    public function show(JobPosting $job)
    {
        abort_if($job->status !== 'published', 404);

        $job->load('department', 'position');

        return Inertia::render('careers/Show', [
            'job' => [
                'id' => $job->id,
                'title' => $job->title,
                'department' => $job->department?->name,
                'position' => $job->position?->name,
                'location' => $job->location,
                'type' => $job->type,
                'work_mode' => $job->work_mode,
                'salary_min' => $job->salary_min,
                'salary_max' => $job->salary_max,
                'description' => $job->description,
                'requirements' => $job->requirements,
                'deadline' => $job->deadline?->format('Y-m-d'),
            ],
            'recaptcha' => [
                'enabled' => filter_var(Setting::get('recaptcha_enabled', false), FILTER_VALIDATE_BOOLEAN),
                'site_key' => Setting::get('recaptcha_site_key', ''),
            ],
            'applied' => request()->boolean('applied'),
        ]);
    }

    public function apply(Request $request, JobPosting $job)
    {
        abort_if($job->status !== 'published', 404);

        // reCAPTCHA verification
        if (filter_var(Setting::get('recaptcha_enabled', false), FILTER_VALIDATE_BOOLEAN)) {
            $token = $request->input('g_recaptcha_response');
            $secret = Setting::get('recaptcha_secret_key');

            $verified = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secret,
                'response' => $token,
                'remoteip' => $request->ip(),
            ])->json('success');

            if (! $verified) {
                return back()->withErrors(['captcha' => 'reCAPTCHA verification failed. Please try again.']);
            }
        }

        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:200',
            'phone' => 'nullable|string|max:30',
            'current_company' => 'nullable|string|max:200',
            'current_title' => 'nullable|string|max:200',
            'experience_years' => 'nullable|numeric|min:0|max:50',
            'cover_letter' => 'nullable|string|max:5000',
        ]);

        $data['job_posting_id'] = $job->id;
        $application = JobApplication::create($data);

        // Notify all admin & HR users
        $admins = User::role(['Admin', 'HR Manager'])->get();
        foreach ($admins as $admin) {
            $admin->notify(new NewJobApplication($job, $application));
        }

        return redirect("/careers/{$job->id}?applied=1");
    }
}
