<?php

namespace Modules\Performance\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\PerformanceCycle;
use App\Models\PerformanceGoal;
use App\Models\PerformanceRating;
use App\Models\PerformanceReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PerformanceCycleController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $canManage = $user->hasAnyPermission(['performance.manage', 'employees.create']);
        $employee = Employee::where('user_id', $user->id)->first();

        $cycles = PerformanceCycle::orderByDesc('start_date')->get();

        // ── Employee personal performance view ──────────────────────────────
        if (! $canManage) {
            if (! $employee) {
                return Inertia::render('performance/Index', [
                    'canManage' => false,
                    'hasEmployee' => false,
                    'myReviews' => [],
                    'myGoals' => [],
                    'myRatings' => [],
                    'cycles' => [],
                ]);
            }

            $myReviews = PerformanceReview::where('employee_id', $employee->id)
                ->with(['cycle:id,name,status,start_date,end_date', 'items'])
                ->orderByDesc('created_at')
                ->get()
                ->map(fn ($r) => [
                    'id' => $r->id,
                    'type' => $r->type,
                    'status' => $r->status,
                    'overall_comments' => $r->overall_comments,
                    'submitted_at' => $r->submitted_at?->format('d M Y'),
                    'avg_score' => $r->items->count()
                        ? round($r->items->avg('rating'), 1)
                        : null,
                    'cycle' => [
                        'id' => $r->cycle->id,
                        'name' => $r->cycle->name,
                        'status' => $r->cycle->status,
                    ],
                ]);

            $myGoals = PerformanceGoal::where('employee_id', $employee->id)
                ->with('cycle:id,name,status')
                ->orderByDesc('created_at')
                ->get()
                ->map(fn ($g) => [
                    'id' => $g->id,
                    'title' => $g->title,
                    'description' => $g->description,
                    'weight' => $g->weight,
                    'progress' => $g->progress,
                    'status' => $g->status,
                    'due_date' => $g->due_date?->format('d M Y'),
                    'cycle' => ['id' => $g->cycle->id, 'name' => $g->cycle->name, 'status' => $g->cycle->status],
                ]);

            $myRatings = PerformanceRating::where('employee_id', $employee->id)
                ->with('cycle:id,name,status')
                ->orderByDesc('created_at')
                ->get()
                ->map(fn ($r) => [
                    'id' => $r->id,
                    'self_score' => $r->self_score,
                    'manager_score' => $r->manager_score,
                    'final_score' => $r->final_score,
                    'rating_label' => $r->rating_label,
                    'finalised_at' => $r->finalised_at?->format('d M Y'),
                    'cycle' => ['id' => $r->cycle->id, 'name' => $r->cycle->name],
                ]);

            $cycleList = $cycles->map(fn ($c) => [
                'id' => $c->id, 'name' => $c->name, 'status' => $c->status,
            ]);

            return Inertia::render('performance/Index', [
                'canManage' => false,
                'hasEmployee' => true,
                'myReviews' => $myReviews,
                'myGoals' => $myGoals,
                'myRatings' => $myRatings,
                'cycles' => $cycleList,
            ]);
        }

        // ── Manager / HR view ───────────────────────────────────────────────
        $cycleData = $cycles->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'start_date' => $c->start_date->format('d M Y'),
            'end_date' => $c->end_date->format('d M Y'),
            'status' => $c->status,
            'created_by' => optional($c->creator)->name,
            'goals_count' => $c->goals()->count(),
            'reviews_count' => $c->reviews()->count(),
            'ratings_count' => $c->ratings()->count(),
        ]);

        return Inertia::render('performance/Index', [
            'canManage' => true,
            'cycles' => $cycleData,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        PerformanceCycle::create([...$data, 'status' => 'active', 'created_by' => $request->user()->id]);

        return back()->with('success', 'Performance cycle created.');
    }

    public function show(PerformanceCycle $cycle)
    {
        $cycle->load(['creator:id,name']);

        $employees = Employee::where('employment_status', 'Active')
            ->with(['department:id,name', 'position:id,name'])
            ->get()
            ->map(function ($emp) use ($cycle) {
                $selfReview = PerformanceReview::where('employee_id', $emp->id)->where('cycle_id', $cycle->id)->where('type', 'self')->first();
                $managerReview = PerformanceReview::where('employee_id', $emp->id)->where('cycle_id', $cycle->id)->where('type', 'manager')->first();
                $rating = PerformanceRating::where('employee_id', $emp->id)->where('cycle_id', $cycle->id)->first();

                return [
                    'id' => $emp->id,
                    'name' => $emp->first_name.' '.$emp->last_name,
                    'employee_code' => $emp->employee_id,
                    'department' => $emp->department?->name,
                    'position' => $emp->position?->name,
                    'self_review_id' => $selfReview?->id,
                    'self_status' => $selfReview?->status ?? 'not_started',
                    'manager_review_id' => $managerReview?->id,
                    'manager_status' => $managerReview?->status ?? 'not_started',
                    'final_score' => $rating?->final_score,
                    'rating_label' => $rating?->rating_label,
                    'finalised' => $rating?->finalised_at !== null,
                ];
            });

        return Inertia::render('performance/cycles/Show', [
            'cycle' => [
                'id' => $cycle->id,
                'name' => $cycle->name,
                'start_date' => $cycle->start_date->format('d M Y'),
                'end_date' => $cycle->end_date->format('d M Y'),
                'status' => $cycle->status,
                'created_by' => $cycle->creator?->name,
            ],
            'employees' => $employees,
        ]);
    }

    public function close(PerformanceCycle $cycle)
    {
        abort_if($cycle->status === 'closed', 403, 'Cycle is already closed.');
        $cycle->update(['status' => 'closed']);

        return back()->with('success', 'Cycle closed.');
    }
}
