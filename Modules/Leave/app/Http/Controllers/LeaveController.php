<?php

namespace Modules\Leave\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $canManage = $user->hasAnyPermission(['leaves.manage', 'leaves.approve']);
        $myEmployee = Employee::where('user_id', $user->id)->first();

        $status = $request->get('status', 'all');

        $query = LeaveRequest::with([
            'employee:id,first_name,last_name,employee_id',
            'leaveType:id,name,code,color',
        ])->orderBy('created_at', 'desc');

        // Self-service users only see their own requests
        if (! $canManage && $myEmployee) {
            $query->where('employee_id', $myEmployee->id);
        } elseif ($canManage && $request->get('employee_id')) {
            $query->where('employee_id', $request->get('employee_id'));
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $requests = $query->get()->map(fn ($r) => $this->formatRequest($r));
        $employees = $canManage
            ? Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'employee_id'])
                ->map(fn ($e) => ['id' => $e->id, 'name' => $e->first_name.' '.$e->last_name, 'employee_id' => $e->employee_id])
            : collect();
        $types = LeaveType::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'color', 'days_allowed', 'allow_half_day']);

        return Inertia::render('leave/Index', [
            'requests' => $requests,
            'employees' => $employees,
            'types' => $types,
            'status' => $status,
            'canManage' => $canManage,
            'myEmployee' => $myEmployee ? ['id' => $myEmployee->id, 'name' => $myEmployee->first_name.' '.$myEmployee->last_name] : null,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $canManage = $user->hasAnyPermission(['leaves.manage', 'leaves.approve']);

        // Self-service: always use the authenticated user's own employee record
        if (! $canManage) {
            $myEmployee = Employee::where('user_id', $user->id)->first();
            if (! $myEmployee) {
                return back()->withErrors(['employee_id' => 'No employee record linked to your account. Contact HR.']);
            }
            $request->merge(['employee_id' => $myEmployee->id]);
        }

        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_half_day' => 'boolean',
            'half_day_period' => 'nullable|in:morning,afternoon',
            'reason' => 'required|string|max:1000',
        ]);

        // Calculate days
        $data['days'] = $this->calculateDays($data['start_date'], $data['end_date'], $data['is_half_day'] ?? false);

        // Overlap check
        $overlap = LeaveRequest::where('employee_id', $data['employee_id'])
            ->whereIn('status', ['pending', 'approved'])
            ->where(fn ($q) => $q->whereBetween('start_date', [$data['start_date'], $data['end_date']])
                ->orWhereBetween('end_date', [$data['start_date'], $data['end_date']])
            )->exists();

        if ($overlap) {
            return back()->withErrors(['start_date' => 'Leave dates overlap with an existing request.']);
        }

        // Balance check
        $year = now()->year;
        $balance = LeaveBalance::firstOrCreate(
            ['employee_id' => $data['employee_id'], 'leave_type_id' => $data['leave_type_id'], 'year' => $year],
            ['entitled' => LeaveType::find($data['leave_type_id'])->days_allowed, 'used' => 0, 'pending' => 0, 'carried_forward' => 0]
        );

        $available = $balance->entitled + $balance->carried_forward - $balance->used - $balance->pending;
        if ($data['days'] > $available) {
            return back()->withErrors(['leave_type_id' => "Insufficient balance. Available: {$available} days."]);
        }

        $leave = LeaveRequest::create($data);

        // Update pending balance
        $balance->increment('pending', $data['days']);

        return back()->with('success', 'Leave request submitted.');
    }

    public function approve(Request $request, LeaveRequest $leave)
    {
        if ($leave->status !== 'pending') {
            return back()->withErrors(['status' => 'Request is not pending.']);
        }

        $data = $request->validate(['approver_comment' => 'nullable|string|max:500']);

        $leave->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approver_comment' => $data['approver_comment'] ?? null,
            'actioned_at' => now(),
        ]);

        // Move from pending → used
        $this->adjustBalance($leave, 'approve');

        return back()->with('success', 'Leave approved.');
    }

    public function reject(Request $request, LeaveRequest $leave)
    {
        if ($leave->status !== 'pending') {
            return back()->withErrors(['status' => 'Request is not pending.']);
        }

        $data = $request->validate(['approver_comment' => 'nullable|string|max:500']);

        $leave->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'approver_comment' => $data['approver_comment'] ?? null,
            'actioned_at' => now(),
        ]);

        $this->adjustBalance($leave, 'reject');

        return back()->with('success', 'Leave rejected.');
    }

    public function cancel(LeaveRequest $leave)
    {
        if (! in_array($leave->status, ['pending', 'approved'])) {
            return back()->withErrors(['status' => 'Cannot cancel this request.']);
        }

        $wasApproved = $leave->status === 'approved';
        $leave->update(['status' => 'cancelled', 'actioned_at' => now()]);

        $this->adjustBalance($leave, $wasApproved ? 'cancel_approved' : 'cancel_pending');

        return back()->with('success', 'Leave cancelled.');
    }

    public function calendar(Request $request)
    {
        $month = $request->get('month', now()->format('Y-m'));
        [$y, $m] = explode('-', $month);

        $approved = LeaveRequest::with(['employee:id,first_name,last_name', 'leaveType:id,name,color'])
            ->where('status', 'approved')
            ->where(fn ($q) => $q->whereYear('start_date', $y)->whereMonth('start_date', $m)
                ->orWhereYear('end_date', $y)->whereMonth('end_date', $m)
            )
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'employee' => $r->employee->first_name.' '.$r->employee->last_name,
                'leave_type' => ['name' => $r->leaveType->name, 'color' => $r->leaveType->color],
                'start_date' => $r->start_date->format('Y-m-d'),
                'end_date' => $r->end_date->format('Y-m-d'),
                'days' => $r->days,
            ]);

        return Inertia::render('leave/Calendar', compact('approved', 'month'));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function formatRequest(LeaveRequest $r): array
    {
        return [
            'id' => $r->id,
            'employee' => $r->employee ? [
                'id' => $r->employee->id,
                'name' => $r->employee->first_name.' '.$r->employee->last_name,
                'employee_id' => $r->employee->employee_id,
            ] : null,
            'leave_type' => $r->leaveType ? [
                'id' => $r->leaveType->id,
                'name' => $r->leaveType->name,
                'code' => $r->leaveType->code,
                'color' => $r->leaveType->color,
            ] : null,
            'start_date' => $r->start_date?->format('Y-m-d'),
            'end_date' => $r->end_date?->format('Y-m-d'),
            'days' => $r->days,
            'is_half_day' => $r->is_half_day,
            'half_day_period' => $r->half_day_period,
            'reason' => $r->reason,
            'status' => $r->status,
            'approver_comment' => $r->approver_comment,
            'actioned_at' => $r->actioned_at?->format('Y-m-d H:i'),
            'created_at' => $r->created_at->format('Y-m-d'),
        ];
    }

    private function calculateDays(string $start, string $end, bool $halfDay): float
    {
        if ($halfDay) {
            return 0.5;
        }

        $s = new \DateTime($start);
        $e = new \DateTime($end);
        $days = 0;

        while ($s <= $e) {
            if (! in_array($s->format('N'), ['6', '7'])) { // skip weekends
                $days++;
            }
            $s->modify('+1 day');
        }

        return (float) $days;
    }

    private function adjustBalance(LeaveRequest $leave, string $action): void
    {
        $year = $leave->start_date->year;
        $balance = LeaveBalance::where([
            'employee_id' => $leave->employee_id,
            'leave_type_id' => $leave->leave_type_id,
            'year' => $year,
        ])->first();

        if (! $balance) {
            return;
        }

        match ($action) {
            'approve' => tap($balance)->decrement('pending', $leave->days)->increment('used', $leave->days),
            'reject' => $balance->decrement('pending', $leave->days),
            'cancel_pending' => $balance->decrement('pending', $leave->days),
            'cancel_approved' => $balance->decrement('used', $leave->days),
            default => null,
        };
    }
}
