<?php

namespace Modules\Training\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\Training\app\Models\TrainingCourse;
use Modules\Training\app\Models\TrainingSession;

class TrainingSessionController extends Controller
{
    public function create(TrainingCourse $course)
    {
        return Inertia::render('training/sessions/Create', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
            ],
        ]);
    }

    public function store(Request $request, TrainingCourse $course)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'max_participants' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        TrainingSession::create([
            ...$data,
            'course_id' => $course->id,
            'status' => 'scheduled',
            'created_by' => $request->user()->id,
        ]);

        return redirect('/training')->with('success', 'Session scheduled.');
    }

    public function show(TrainingSession $session)
    {
        $session->load(['course', 'enrollments.employee.department', 'enrollments.employee.position']);

        $enrolled = Employee::where('employment_status', 'Active')
            ->whereNotIn('id', $session->enrollments->pluck('employee_id'))
            ->with('department:id,name', 'position:id,name')
            ->orderBy('first_name')
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'name' => $e->first_name.' '.$e->last_name,
                'department' => $e->department?->name,
                'position' => $e->position?->name,
            ]);

        return Inertia::render('training/sessions/Show', [
            'session' => [
                'id' => $session->id,
                'title' => $session->title,
                'start_date' => $session->start_date->format('d M Y'),
                'end_date' => $session->end_date->format('d M Y'),
                'location' => $session->location,
                'max_participants' => $session->max_participants,
                'status' => $session->status,
                'notes' => $session->notes,
                'course' => [
                    'id' => $session->course->id,
                    'title' => $session->course->title,
                    'duration_hours' => $session->course->duration_hours,
                    'category' => $session->course->category,
                    'delivery_mode' => $session->course->delivery_mode,
                ],
                'enrollments' => $session->enrollments->map(fn ($e) => [
                    'id' => $e->id,
                    'employee_id' => $e->employee_id,
                    'employee_name' => $e->employee->first_name.' '.$e->employee->last_name,
                    'department' => $e->employee->department?->name,
                    'position' => $e->employee->position?->name,
                    'status' => $e->status,
                    'score' => $e->score,
                    'feedback' => $e->feedback,
                    'completed_at' => $e->completed_at?->format('d M Y'),
                ]),
            ],
            'available_employees' => $enrolled,
        ]);
    }

    public function update(Request $request, TrainingSession $session)
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'max_participants' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:scheduled,ongoing,completed,cancelled',
            'notes' => 'nullable|string|max:1000',
        ]);

        $session->update($data);

        // Mark all enrolled as completed when session is completed
        if (isset($data['status']) && $data['status'] === 'completed') {
            $session->enrollments()->where('status', 'enrolled')
                ->update(['status' => 'completed', 'completed_at' => now()]);
        }

        return back()->with('success', 'Session updated.');
    }

    public function destroy(TrainingSession $session)
    {
        $session->delete();

        return redirect('/training')->with('success', 'Session deleted.');
    }
}
