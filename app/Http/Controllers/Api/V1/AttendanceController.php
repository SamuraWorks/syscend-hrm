<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AttendanceController extends ApiController
{
    /**
     * List attendance records — paginated with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Attendance::with('employee:id,first_name,last_name,employee_id')
            ->when($request->employee_id, fn ($q, $v) => $q->where('employee_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->date_from, fn ($q, $v) => $q->whereDate('date', '>=', $v))
            ->when($request->date_to, fn ($q, $v) => $q->whereDate('date', '<=', $v))
            ->orderByDesc('date');

        return $this->paginated($query->paginate(15));
    }

    /**
     * Record check-in for the authenticated user's employee profile.
     */
    public function checkIn(Request $request): JsonResponse
    {
        $employee = Employee::where('user_id', $request->user()->id)->first();

        if (! $employee) {
            return $this->error('No employee profile linked to your account.', 404);
        }

        $today = Carbon::today()->toDateString();

        $attendance = Attendance::firstOrCreate(
            ['employee_id' => $employee->id, 'date' => $today],
            ['status' => 'present']
        );

        if ($attendance->check_in) {
            return $this->error('Already checked in today.');
        }

        $attendance->update(['check_in' => now(), 'status' => 'present']);

        return $this->success($attendance, 'Check-in recorded successfully');
    }

    /**
     * Record check-out for the authenticated user's employee profile.
     */
    public function checkOut(Request $request): JsonResponse
    {
        $employee = Employee::where('user_id', $request->user()->id)->first();

        if (! $employee) {
            return $this->error('No employee profile linked to your account.', 404);
        }

        $today = Carbon::today()->toDateString();

        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        if (! $attendance || ! $attendance->check_in) {
            return $this->error('No check-in found for today.');
        }

        if ($attendance->check_out) {
            return $this->error('Already checked out today.');
        }

        $checkIn = Carbon::parse($attendance->check_in);
        $checkOut = now();
        $worked = (int) $checkIn->diffInMinutes($checkOut);

        $attendance->update([
            'check_out' => $checkOut,
            'worked_minutes' => $worked,
        ]);

        return $this->success($attendance, 'Check-out recorded successfully');
    }

    /**
     * Get attendance records for a specific employee.
     */
    public function byEmployee(Request $request, Employee $employee): JsonResponse
    {
        $query = Attendance::where('employee_id', $employee->id)
            ->when($request->date_from, fn ($q, $v) => $q->whereDate('date', '>=', $v))
            ->when($request->date_to, fn ($q, $v) => $q->whereDate('date', '<=', $v))
            ->orderByDesc('date');

        return $this->paginated($query->paginate(15));
    }
}
