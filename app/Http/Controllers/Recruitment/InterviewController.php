<?php

namespace App\Http\Controllers\Recruitment;

use App\Http\Controllers\Controller;
use App\Models\InterviewSchedule;
use App\Models\JobApplication;
use Illuminate\Http\Request;

class InterviewController extends Controller
{
    public function store(Request $request, JobApplication $application)
    {
        $data = $request->validate([
            'title' => 'required|string|max:200',
            'scheduled_at' => 'required|date',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'mode' => 'required|in:in_person,video,phone',
            'location_or_link' => 'nullable|string|max:500',
            'interviewer_name' => 'nullable|string|max:200',
        ]);

        $data['job_application_id'] = $application->id;
        InterviewSchedule::create($data);

        // Move applicant to interviewed stage if still new/shortlisted
        if (in_array($application->stage, ['new', 'shortlisted'])) {
            $application->update(['stage' => 'shortlisted']);
        }

        return back()->with('success', 'Interview scheduled.');
    }

    public function update(Request $request, InterviewSchedule $interview)
    {
        $data = $request->validate([
            'status' => 'nullable|in:scheduled,completed,cancelled',
            'feedback' => 'nullable|string|max:2000',
            'rating' => 'nullable|integer|min:1|max:5',
        ]);

        $interview->update(array_filter($data, fn ($v) => ! is_null($v)));

        return back()->with('success', 'Interview updated.');
    }

    public function destroy(InterviewSchedule $interview)
    {
        $interview->delete();

        return back()->with('success', 'Interview deleted.');
    }
}
