<?php

namespace App\Http\Controllers\Performance;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\PerformanceCycle;
use App\Models\PerformanceRating;
use App\Models\PerformanceReview;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PerformanceCycleController extends Controller
{
    public function index()
    {
        $cycles = PerformanceCycle::withCount(['goals', 'reviews', 'ratings'])
            ->with('creator:id,name')
            ->orderByDesc('start_date')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'start_date' => $c->start_date->format('d M Y'),
                'end_date' => $c->end_date->format('d M Y'),
                'status' => $c->status,
                'created_by' => $c->creator?->name,
                'goals_count' => $c->goals_count,
                'reviews_count' => $c->reviews_count,
                'ratings_count' => $c->ratings_count,
            ]);

        return Inertia::render('performance/Index', compact('cycles'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        PerformanceCycle::create([
            ...$data,
            'status' => 'active',
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Performance cycle created.');
    }

    public function show(PerformanceCycle $cycle)
    {
        $cycle->load(['creator:id,name']);

        // All active employees with their review + rating for this cycle
        $employees = Employee::where('employment_status', 'Active')
            ->with([
                'department:id,name',
                'position:id,name',
            ])
            ->get()
            ->map(function ($emp) use ($cycle) {
                $selfReview = PerformanceReview::where('employee_id', $emp->id)
                    ->where('cycle_id', $cycle->id)
                    ->where('type', 'self')
                    ->first();
                $managerReview = PerformanceReview::where('employee_id', $emp->id)
                    ->where('cycle_id', $cycle->id)
                    ->where('type', 'manager')
                    ->first();
                $rating = PerformanceRating::where('employee_id', $emp->id)
                    ->where('cycle_id', $cycle->id)
                    ->first();

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
