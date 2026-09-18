<?php

namespace App\Http\Controllers\Performance;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\PerformanceCycle;
use App\Models\PerformanceGoal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PerformanceGoalController extends Controller
{
    public function index(Request $request)
    {
        // Determine the employee to show goals for
        $user = $request->user();
        $employee = Employee::where('user_id', $user->id)->first();

        $cycles = PerformanceCycle::orderByDesc('start_date')->get(['id', 'name', 'status']);
        $activeCycle = $cycles->firstWhere('status', 'active');

        $selectedCycleId = $request->input('cycle_id', $activeCycle?->id);
        $selectedCycle = $selectedCycleId ? PerformanceCycle::find($selectedCycleId) : null;

        $goals = [];
        if ($employee && $selectedCycle) {
            $goals = PerformanceGoal::where('employee_id', $employee->id)
                ->where('cycle_id', $selectedCycle->id)
                ->orderBy('created_at')
                ->get()
                ->map(fn ($g) => [
                    'id' => $g->id,
                    'title' => $g->title,
                    'description' => $g->description,
                    'weight' => $g->weight,
                    'progress' => $g->progress,
                    'status' => $g->status,
                    'due_date' => $g->due_date?->format('Y-m-d'),
                ]);
        }

        return Inertia::render('performance/goals/Index', [
            'cycles' => $cycles->map(fn ($c) => ['id' => $c->id, 'name' => $c->name, 'status' => $c->status]),
            'selected_cycle' => $selectedCycle ? ['id' => $selectedCycle->id, 'name' => $selectedCycle->name, 'status' => $selectedCycle->status] : null,
            'goals' => $goals,
            'has_employee' => $employee !== null,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $employee = Employee::where('user_id', $user->id)->firstOrFail();

        $data = $request->validate([
            'cycle_id' => 'required|exists:performance_cycles,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'weight' => 'required|integer|min:0|max:100',
            'due_date' => 'nullable|date',
        ]);

        $cycle = PerformanceCycle::findOrFail($data['cycle_id']);
        abort_if($cycle->status === 'closed', 403, 'Cannot add goals to a closed cycle.');

        PerformanceGoal::create([
            ...$data,
            'employee_id' => $employee->id,
            'progress' => 0,
            'status' => 'active',
        ]);

        return back()->with('success', 'Goal added.');
    }

    public function update(Request $request, PerformanceGoal $goal)
    {
        $user = $request->user();
        $employee = Employee::where('user_id', $user->id)->first();

        // Employees can only update their own goals
        if ($employee && $goal->employee_id !== $employee->id) {
            abort(403);
        }

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'weight' => 'sometimes|integer|min:0|max:100',
            'progress' => 'sometimes|integer|min:0|max:100',
            'status' => 'sometimes|in:draft,active,completed',
            'due_date' => 'nullable|date',
        ]);

        $goal->update($data);

        // Auto-set completed if progress reaches 100
        if (isset($data['progress']) && (int) $data['progress'] === 100) {
            $goal->update(['status' => 'completed']);
        }

        return back()->with('success', 'Goal updated.');
    }

    public function destroy(PerformanceGoal $goal)
    {
        $user = request()->user();
        $employee = Employee::where('user_id', $user->id)->first();

        if ($employee && $goal->employee_id !== $employee->id) {
            abort(403);
        }

        abort_if($goal->cycle->status === 'closed', 403, 'Cannot delete goals in a closed cycle.');

        $goal->delete();

        return back()->with('success', 'Goal deleted.');
    }
}
