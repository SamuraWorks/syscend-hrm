<?php

namespace Modules\Recruitment\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\JobPosting;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function store(Request $request, JobPosting $job)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:200',
            'phone' => 'nullable|string|max:30',
            'current_company' => 'nullable|string|max:200',
            'current_title' => 'nullable|string|max:200',
            'experience_years' => 'nullable|numeric|min:0|max:50',
            'cover_letter' => 'nullable|string|max:3000',
        ]);

        $data['job_posting_id'] = $job->id;

        JobApplication::create($data);

        return redirect("/recruitment/{$job->id}")->with('success', 'Application submitted.');
    }

    public function updateStage(Request $request, JobApplication $application)
    {
        $application->update([
            'stage' => $request->validate(['stage' => 'required|in:new,shortlisted,interviewed,offered,hired,rejected'])['stage'],
        ]);

        return back()->with('success', 'Stage updated.');
    }

    public function updateRating(Request $request, JobApplication $application)
    {
        $application->update([
            'rating' => $request->validate(['rating' => 'required|integer|min:1|max:5'])['rating'],
        ]);

        return back()->with('success', 'Rating updated.');
    }

    public function updateNotes(Request $request, JobApplication $application)
    {
        $application->update([
            'notes' => $request->validate(['notes' => 'nullable|string|max:2000'])['notes'],
        ]);

        return back()->with('success', 'Notes updated.');
    }

    public function destroy(JobApplication $application)
    {
        $jobId = $application->job_posting_id;
        $application->delete();

        return redirect("/recruitment/{$jobId}")->with('success', 'Application deleted.');
    }
}
