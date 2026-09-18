<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\PayrollRun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportsController extends ApiController
{
    /**
     * Headcount report: total active, by department, by gender, by contract type.
     */
    public function headcount(): JsonResponse
    {
        $totalActive = Employee::where('employment_status', 'active')->count();

        $byDepartment = Employee::where('employment_status', 'active')
            ->select('department_id', DB::raw('count(*) as count'))
            ->with('department:id,name')
            ->groupBy('department_id')
            ->get()
            ->map(fn ($row) => [
                'department' => $row->department?->name ?? 'Unassigned',
                'count' => $row->count,
            ]);

        $byGender = Employee::where('employment_status', 'active')
            ->select('gender', DB::raw('count(*) as count'))
            ->groupBy('gender')
            ->pluck('count', 'gender');

        $byContractType = Employee::where('employment_status', 'active')
            ->select('contract_type', DB::raw('count(*) as count'))
            ->groupBy('contract_type')
            ->pluck('count', 'contract_type');

        return $this->success([
            'total_active' => $totalActive,
            'by_department' => $byDepartment,
            'by_gender' => $byGender,
            'by_contract_type' => $byContractType,
        ]);
    }

    /**
     * Attendance report for a given month and year.
     */
    public function attendance(Request $request): JsonResponse
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        $month = $request->integer('month');
        $year = $request->integer('year');

        $records = Attendance::whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get();

        $totalRecords = $records->count();
        $presentCount = $records->where('status', 'present')->count();
        $workingDays = $records->groupBy('date')->count();
        $avgRate = $workingDays > 0
            ? round(($presentCount / max($totalRecords, 1)) * 100, 2)
            : 0;

        $byDepartment = Attendance::whereMonth('date', $month)
            ->whereYear('date', $year)
            ->where('status', 'present')
            ->join('employees', 'attendances.employee_id', '=', 'employees.id')
            ->join('departments', 'employees.department_id', '=', 'departments.id')
            ->select('departments.name as department', DB::raw('count(*) as present_count'))
            ->groupBy('departments.name')
            ->pluck('present_count', 'department');

        $dailyTrend = Attendance::whereMonth('date', $month)
            ->whereYear('date', $year)
            ->select('date', DB::raw('count(*) as total'), DB::raw('sum(case when status = "present" then 1 else 0 end) as present'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $this->success([
            'working_days' => $workingDays,
            'avg_rate' => $avgRate,
            'by_department' => $byDepartment,
            'daily_trend' => $dailyTrend,
        ]);
    }

    /**
     * Leave report for a given year.
     */
    public function leave(Request $request): JsonResponse
    {
        $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        $year = $request->integer('year');

        $approved = LeaveRequest::where('status', 'approved')
            ->whereYear('start_date', $year)
            ->get();

        $totalApproved = $approved->count();
        $totalDays = $approved->sum('days');

        $byType = LeaveRequest::where('status', 'approved')
            ->whereYear('start_date', $year)
            ->join('leave_types', 'leave_requests.leave_type_id', '=', 'leave_types.id')
            ->select('leave_types.name as type', DB::raw('count(*) as count'), DB::raw('sum(days) as total_days'))
            ->groupBy('leave_types.name')
            ->get();

        $monthlyTrend = LeaveRequest::where('status', 'approved')
            ->whereYear('start_date', $year)
            ->select(
                DB::raw('month(start_date) as month'),
                DB::raw('count(*) as count'),
                DB::raw('sum(days) as total_days')
            )
            ->groupBy(DB::raw('month(start_date)'))
            ->orderBy(DB::raw('month(start_date)'))
            ->get();

        return $this->success([
            'total_approved' => $totalApproved,
            'total_days' => $totalDays,
            'by_type' => $byType,
            'monthly_trend' => $monthlyTrend,
        ]);
    }

    /**
     * Payroll report for a given year.
     */
    public function payroll(Request $request): JsonResponse
    {
        $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        $year = $request->integer('year');

        $runs = PayrollRun::where('year', $year)->get();

        $totalGross = $runs->sum('total_gross');
        $totalNet = $runs->sum('total_net');
        $runsCount = $runs->count();

        $monthly = $runs->sortBy('month')->map(fn ($run) => [
            'month' => $run->month,
            'title' => $run->title,
            'status' => $run->status,
            'total_gross' => $run->total_gross,
            'total_net' => $run->total_net,
            'employees' => $run->total_employees,
        ])->values();

        return $this->success([
            'total_gross' => $totalGross,
            'total_net' => $totalNet,
            'runs_count' => $runsCount,
            'monthly' => $monthly,
        ]);
    }
}
