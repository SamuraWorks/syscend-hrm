<?php

namespace Modules\Training\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Modules\Training\app\Models\TrainingCourse;
use Modules\Training\app\Models\TrainingEnrollment;
use Modules\Training\app\Models\TrainingSession;

class TrainingCourseController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $canManage = $user->hasAnyPermission(['training.manage', 'employees.create']);
        $employee = Employee::where('user_id', $user->id)->first();

        // ── Employee personal training view ──────────────────────────────────
        if (! $canManage) {
            $myEnrollments = $employee
                ? TrainingEnrollment::where('employee_id', $employee->id)
                    ->with(['session.course'])
                    ->orderByDesc('created_at')
                    ->get()
                    ->map(fn ($e) => [
                        'id' => $e->id,
                        'status' => $e->status,
                        'score' => $e->score,
                        'feedback' => $e->feedback,
                        'completed_at' => $e->completed_at?->format('d M Y'),
                        'session' => $e->session ? [
                            'id' => $e->session->id,
                            'title' => $e->session->title,
                            'start_date' => $e->session->start_date?->format('d M Y'),
                            'end_date' => $e->session->end_date?->format('d M Y'),
                            'location' => $e->session->location,
                        ] : null,
                        'course' => $e->session?->course ? [
                            'id' => $e->session->course->id,
                            'title' => $e->session->course->title,
                            'category' => $e->session->course->category,
                            'delivery_mode' => $e->session->course->delivery_mode,
                            'duration_hours' => $e->session->course->duration_hours,
                            'provider' => $e->session->course->provider,
                        ] : null,
                    ])
                : collect();

            // Personal stats
            $stats = [
                'enrolled' => $myEnrollments->whereIn('status', ['enrolled'])->count(),
                'completed' => $myEnrollments->where('status', 'completed')->count(),
                'in_progress' => $myEnrollments->where('status', 'in_progress')->count(),
                'total_hours' => $myEnrollments->sum(fn ($e) => $e['course']['duration_hours'] ?? 0),
            ];

            // Available course catalog (active courses)
            $catalog = TrainingCourse::where('status', 'active')
                ->withCount('sessions')
                ->orderBy('title')
                ->get()
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'title' => $c->title,
                    'category' => $c->category,
                    'delivery_mode' => $c->delivery_mode,
                    'duration_hours' => $c->duration_hours,
                    'provider' => $c->provider,
                    'sessions_count' => $c->sessions_count,
                ]);

            return Inertia::render('training/Index', [
                'canManage' => false,
                'myEnrollments' => $myEnrollments,
                'stats' => $stats,
                'catalog' => $catalog,
            ]);
        }

        // ── Manager / HR view ────────────────────────────────────────────────
        $courses = TrainingCourse::withCount('sessions')
            ->with('creator:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'title' => $c->title,
                'description' => $c->description,
                'category' => $c->category,
                'delivery_mode' => $c->delivery_mode,
                'duration_hours' => $c->duration_hours,
                'provider' => $c->provider,
                'cost' => $c->cost,
                'status' => $c->status,
                'sessions_count' => $c->sessions_count,
                'created_by' => $c->creator?->name,
            ]);

        $stats = [
            'total_courses' => TrainingCourse::where('status', 'active')->count(),
            'total_sessions' => TrainingSession::count(),
            'total_enrollments' => TrainingEnrollment::count(),
            'completions' => TrainingEnrollment::where('status', 'completed')->count(),
        ];

        $categories = TrainingCourse::select('category')->distinct()->pluck('category')->filter()->values();

        return Inertia::render('training/Index', [
            'canManage' => true,
            'courses' => $courses,
            'stats' => $stats,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category' => 'nullable|string|max:100',
            'delivery_mode' => 'required|in:online,in_person,hybrid',
            'duration_hours' => 'required|integer|min:0',
            'provider' => 'nullable|string|max:255',
            'cost' => 'required|numeric|min:0',
        ]);

        TrainingCourse::create([...$data, 'created_by' => $request->user()->id, 'status' => 'active']);

        return back()->with('success', 'Course created.');
    }

    public function update(Request $request, TrainingCourse $course)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category' => 'nullable|string|max:100',
            'delivery_mode' => 'required|in:online,in_person,hybrid',
            'duration_hours' => 'required|integer|min:0',
            'provider' => 'nullable|string|max:255',
            'cost' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        $course->update($data);

        return back()->with('success', 'Course updated.');
    }

    public function destroy(TrainingCourse $course)
    {
        $course->delete();

        return back()->with('success', 'Course deleted.');
    }
}
