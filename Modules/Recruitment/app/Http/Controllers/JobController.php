<?php

namespace Modules\Recruitment\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\JobPosting;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status', 'all');

        $query = JobPosting::withCount('applications')->orderBy('created_at', 'desc');
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $jobs = $query->get()->map(fn ($j) => [
            'id' => $j->id,
            'title' => $j->title,
            'department' => $j->department?->name,
            'location' => $j->location,
            'type' => $j->type,
            'work_mode' => $j->work_mode,
            'status' => $j->status,
            'deadline' => $j->deadline?->format('Y-m-d'),
            'applications_count' => $j->applications_count,
            'created_at' => $j->created_at->format('Y-m-d'),
        ]);

        return Inertia::render('recruitment/jobs/Index', compact('jobs', 'status'));
    }

    public function create()
    {
        return Inertia::render('recruitment/jobs/Create', [
            'departments' => Department::orderBy('name')->get(['id', 'name']),
            'positions' => Position::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:200',
            'department_id' => 'nullable|exists:departments,id',
            'position_id' => 'nullable|exists:positions,id',
            'location' => 'nullable|string|max:200',
            'type' => 'required|in:full_time,part_time,contract,internship',
            'work_mode' => 'required|in:onsite,remote,hybrid',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'status' => 'required|in:draft,published,closed',
            'deadline' => 'nullable|date',
        ]);

        JobPosting::create($data);

        return redirect('/recruitment')->with('success', 'Job posting created.');
    }

    public function show(JobPosting $job)
    {
        $job->load('department', 'position');

        $applications = $job->applications()->orderBy('created_at', 'desc')->get()->map(fn ($a) => [
            'id' => $a->id,
            'name' => $a->first_name.' '.$a->last_name,
            'email' => $a->email,
            'phone' => $a->phone,
            'current_title' => $a->current_title,
            'current_company' => $a->current_company,
            'experience_years' => $a->experience_years,
            'stage' => $a->stage,
            'rating' => $a->rating,
            'created_at' => $a->created_at->format('Y-m-d'),
        ]);

        // Stage counts for pipeline header
        $stageCounts = $applications->groupBy('stage')->map->count();

        return Inertia::render('recruitment/jobs/Show', [
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
                'status' => $job->status,
                'deadline' => $job->deadline?->format('Y-m-d'),
            ],
            'applications' => $applications,
            'stage_counts' => $stageCounts,
        ]);
    }

    public function edit(JobPosting $job)
    {
        return Inertia::render('recruitment/jobs/Edit', [
            'job' => $job,
            'departments' => Department::orderBy('name')->get(['id', 'name']),
            'positions' => Position::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, JobPosting $job)
    {
        $data = $request->validate([
            'title' => 'required|string|max:200',
            'department_id' => 'nullable|exists:departments,id',
            'position_id' => 'nullable|exists:positions,id',
            'location' => 'nullable|string|max:200',
            'type' => 'required|in:full_time,part_time,contract,internship',
            'work_mode' => 'required|in:onsite,remote,hybrid',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'status' => 'required|in:draft,published,closed',
            'deadline' => 'nullable|date',
        ]);

        $job->update($data);

        return redirect('/recruitment')->with('success', 'Job posting updated.');
    }

    public function destroy(JobPosting $job)
    {
        $job->delete();

        return redirect('/recruitment')->with('success', 'Job posting deleted.');
    }

    public function updateStatus(Request $request, JobPosting $job)
    {
        $job->update(['status' => $request->validate(['status' => 'required|in:draft,published,closed'])['status']]);

        return back()->with('success', 'Status updated.');
    }
}
