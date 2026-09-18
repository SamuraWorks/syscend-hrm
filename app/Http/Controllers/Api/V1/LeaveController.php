<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveController extends ApiController
{
    /**
     * Return all active leave types.
     */
    public function types(): JsonResponse
    {
        return $this->success(LeaveType::where('is_active', true)->get());
    }

    /**
     * List leave requests — employees see only their own; HR/Managers see all.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = LeaveRequest::with([
            'employee:id,first_name,last_name',
            'leaveType:id,name',
        ]);

        if ($user->hasRole('Employee')) {
            $employee = Employee::where('user_id', $user->id)->first();
            if ($employee) {
                $query->where('employee_id', $employee->id);
            }
        }

        $query->when($request->employee_id, fn ($q, $v) => $q->where('employee_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('created_at');

        return $this->paginated($query->paginate(15));
    }

    /**
     * Submit a new leave request for the authenticated employee.
     */
    public function store(Request $request): JsonResponse
    {
        $employee = Employee::where('user_id', $request->user()->id)->first();

        if (! $employee) {
            return $this->error('No employee profile linked to your account.', 404);
        }

        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'days' => 'required|numeric|min:0.5',
            'is_half_day' => 'boolean',
            'half_day_period' => 'nullable|in:morning,afternoon',
            'reason' => 'required|string|max:500',
        ]);

        $leaveRequest = LeaveRequest::create(array_merge($validated, [
            'employee_id' => $employee->id,
            'status' => 'pending',
        ]));

        return $this->success(
            $leaveRequest->load(['employee:id,first_name,last_name', 'leaveType:id,name']),
            'Leave request submitted successfully',
            201
        );
    }

    /**
     * Show a single leave request.
     */
    public function show(LeaveRequest $leaveRequest): JsonResponse
    {
        return $this->success(
            $leaveRequest->load(['employee:id,first_name,last_name', 'leaveType:id,name', 'approver:id,name'])
        );
    }

    /**
     * Update a pending leave request (employee can update their own).
     */
    public function update(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $employee = Employee::where('user_id', $request->user()->id)->first();

        if (! $employee || $leaveRequest->employee_id !== $employee->id) {
            return $this->error('You can only update your own leave requests.', 403);
        }

        if ($leaveRequest->status !== 'pending') {
            return $this->error('Only pending requests can be updated.');
        }

        $validated = $request->validate([
            'leave_type_id' => 'sometimes|exists:leave_types,id',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'days' => 'sometimes|numeric|min:0.5',
            'is_half_day' => 'boolean',
            'half_day_period' => 'nullable|in:morning,afternoon',
            'reason' => 'sometimes|string|max:500',
        ]);

        $leaveRequest->update($validated);

        return $this->success($leaveRequest->fresh(), 'Leave request updated successfully');
    }

    /**
     * Cancel (delete) a pending leave request.
     */
    public function destroy(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $employee = Employee::where('user_id', $request->user()->id)->first();

        if (! $employee || $leaveRequest->employee_id !== $employee->id) {
            return $this->error('You can only cancel your own leave requests.', 403);
        }

        if ($leaveRequest->status !== 'pending') {
            return $this->error('Only pending requests can be cancelled.');
        }

        $leaveRequest->delete();

        return $this->success(null, 'Leave request cancelled successfully');
    }

    /**
     * Approve a leave request (HR/Manager only).
     */
    public function approve(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $leaveRequest->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'actioned_at' => now(),
        ]);

        return $this->success($leaveRequest->fresh(), 'Leave request approved');
    }

    /**
     * Reject a leave request (HR/Manager only).
     */
    public function reject(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $request->validate([
            'comment' => 'nullable|string|max:500',
        ]);

        $leaveRequest->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approver_comment' => $request->comment,
            'actioned_at' => now(),
        ]);

        return $this->success($leaveRequest->fresh(), 'Leave request rejected');
    }
}
