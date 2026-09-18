<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\JobApplication;
use App\Models\JobPosting;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\PayrollRun;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Modules\SystemAdmin\app\Models\AuditLog;
use Modules\Training\app\Models\TrainingEnrollment;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $user = Auth::user();

        // Syscend team account → they live in the /syscend ops portal, not HR dashboards
        if ($user->hasRole('Syscend Admin')) {
            return redirect()->route('syscend.dashboard');
        }

        // Use permissions that only HR/Manager/Admin roles have — NOT employees.view (Employee role has it)
        $canManage = $user->hasAnyPermission(['employees.create', 'leaves.manage', 'leaves.approve', 'payroll.view', 'admin.users']);
        $employee = Employee::where('user_id', $user->id)->with(['department:id,name', 'position:id,name'])->first();

        // ── Employee self-service dashboard ────────────────────────────────────
        // Always show personal dashboard for non-managers, even without a linked record
        if (! $canManage) {
            return Inertia::render('Dashboard', [
                'isEmployee' => true,
                'employeeData' => $employee ? $this->employeeDashboard($employee) : null,
            ]);
        }

        // ── HR / Manager / Admin dashboard ──────────────────────────────────
        return Inertia::render('Dashboard', [
            'isEmployee' => false,
            'stats' => $this->orgStats(),
            'headcountByDept' => $this->headcountByDept(),
            'headcountTrend' => $this->headcountTrend(),
            'attendanceTrend' => $this->attendanceTrend(),
            'leaveByType' => $this->leaveByType(),
            'employmentTypes' => $this->employmentTypes(),
            'genderBreakdown' => $this->genderBreakdown(),
            'recentActivity' => $this->recentActivity(),
        ]);
    }

    // ── Employee personal data ───────────────────────────────────────────────

    private function employeeDashboard(Employee $emp): array
    {
        $today = now()->toDateString();
        $year = now()->year;
        $month = now()->month;
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd = now()->endOfMonth()->toDateString();

        // Today's attendance
        $todayAtt = Attendance::where('employee_id', $emp->id)
            ->where('date', $today)->first();

        // This month attendance summary
        $monthDays = now()->daysInMonth;
        $workedDays = Attendance::where('employee_id', $emp->id)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->whereIn('status', ['present', 'late'])->count();
        $lateDays = Attendance::where('employee_id', $emp->id)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->where('status', 'late')->count();
        $absentDays = Attendance::where('employee_id', $emp->id)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->where('status', 'absent')->count();

        // Attendance last 14 days
        $attHistory = collect(range(13, 0))->map(function ($i) use ($emp) {
            $date = now()->subDays($i)->toDateString();
            $att = Attendance::where('employee_id', $emp->id)->where('date', $date)->first();

            return [
                'date' => $date,
                'label' => Carbon::parse($date)->format('D'),
                'status' => $att?->status ?? 'no_record',
                'check_in' => $att?->check_in,
                'check_out' => $att?->check_out,
            ];
        })->values();

        // Leave balances
        $leaveBalances = LeaveBalance::where('employee_id', $emp->id)
            ->where('year', $year)
            ->with('leaveType:id,name,color,code')
            ->get()
            ->map(fn ($b) => [
                'type' => $b->leaveType?->name ?? '—',
                'color' => $b->leaveType?->color ?? '#6b7280',
                'code' => $b->leaveType?->code ?? '?',
                'entitled' => $b->entitled,
                'used' => $b->used,
                'pending' => $b->pending,
                'carried' => $b->carried_forward,
                'available' => max(0, $b->entitled + $b->carried_forward - $b->used - $b->pending),
            ]);

        // Recent / upcoming leave requests
        $myLeaves = LeaveRequest::where('employee_id', $emp->id)
            ->with('leaveType:id,name,color')
            ->orderByDesc('created_at')
            ->take(5)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'type' => $r->leaveType?->name ?? '—',
                'color' => $r->leaveType?->color ?? '#6b7280',
                'start_date' => $r->start_date?->format('d M Y'),
                'end_date' => $r->end_date?->format('d M Y'),
                'days' => $r->days,
                'status' => $r->status,
                'reason' => $r->reason,
            ]);

        // Training enrollments
        $trainings = TrainingEnrollment::where('employee_id', $emp->id)
            ->with('session.course:id,title')
            ->orderByDesc('created_at')
            ->take(4)
            ->get()
            ->map(fn ($e) => [
                'course' => $e->session?->course?->title ?? '—',
                'status' => $e->status,
            ]);

        // Upcoming leave (approved, in the future)
        $nextLeave = LeaveRequest::where('employee_id', $emp->id)
            ->where('status', 'approved')
            ->where('start_date', '>=', $today)
            ->orderBy('start_date')
            ->first();

        // Joining anniversary / tenure
        $tenureMonths = $emp->date_of_joining
            ? (int) now()->diffInMonths(Carbon::parse($emp->date_of_joining))
            : null;

        return [
            'id' => $emp->id,
            'name' => $emp->first_name.' '.$emp->last_name,
            'employee_id' => $emp->employee_id,
            'department' => $emp->department?->name,
            'position' => $emp->position?->name,
            'contract_type' => $emp->contract_type,
            'date_of_joining' => $emp->date_of_joining?->format('d M Y'),
            'tenure_months' => $tenureMonths,
            'today_att' => $todayAtt ? [
                'status' => $todayAtt->status,
                'check_in' => $todayAtt->check_in,
                'check_out' => $todayAtt->check_out,
                'worked_minutes' => $todayAtt->worked_minutes,
            ] : null,
            'month_stats' => [
                'worked' => $workedDays,
                'late' => $lateDays,
                'absent' => $absentDays,
                'total' => $monthDays,
                'rate' => $monthDays > 0 ? round($workedDays / $monthDays * 100, 1) : 0,
            ],
            'att_history' => $attHistory,
            'leave_balances' => $leaveBalances,
            'my_leaves' => $myLeaves,
            'next_leave' => $nextLeave ? [
                'start_date' => $nextLeave->start_date->format('d M Y'),
                'end_date' => $nextLeave->end_date->format('d M Y'),
                'days' => $nextLeave->days,
                'type' => $nextLeave->leaveType?->name,
            ] : null,
            'trainings' => $trainings,
        ];
    }

    // ── Org-wide helpers ─────────────────────────────────────────────────────

    private function orgStats(): array
    {
        $today = now()->toDateString();
        $thisMonth = now()->month;
        $thisYear = now()->year;

        $totalEmployees = Employee::where('employment_status', 'Active')->count();
        $newThisMonth = Employee::where('employment_status', 'Active')
            ->whereMonth('date_of_joining', $thisMonth)
            ->whereYear('date_of_joining', $thisYear)->count();
        $presentToday = Attendance::where('date', $today)->whereIn('status', ['present', 'late'])->count();
        $attendanceRate = $totalEmployees > 0 ? round($presentToday / $totalEmployees * 100, 1) : 0;
        $onLeaveToday = LeaveRequest::where('status', 'approved')
            ->where('start_date', '<=', $today)->where('end_date', '>=', $today)->count();
        $pendingLeaves = LeaveRequest::where('status', 'pending')->count();
        $openPositions = JobPosting::where('status', 'open')->count();
        $totalApplications = JobApplication::count();
        $totalDepartments = Department::count();

        $lastPayroll = PayrollRun::where('status', 'paid')
            ->orderByDesc('year')->orderByDesc('month')->first();
        $lastPayrollAmount = $lastPayroll ? number_format($lastPayroll->total_net, 0) : '—';
        $lastPayrollLabel = $lastPayroll
                                ? Carbon::create($lastPayroll->year, $lastPayroll->month)->format('M Y')
                                : null;

        $trainingCompletion = TrainingEnrollment::count() > 0
            ? round(TrainingEnrollment::where('status', 'completed')->count() / TrainingEnrollment::count() * 100, 1)
            : 0;
        $pendingApprovals = LeaveRequest::where('status', 'pending')->count()
                          + JobApplication::where('stage', 'interview')->count();

        return [
            'total_employees' => $totalEmployees,
            'new_this_month' => $newThisMonth,
            'present_today' => $presentToday,
            'attendance_rate' => $attendanceRate,
            'on_leave_today' => $onLeaveToday,
            'pending_leaves' => $pendingLeaves,
            'open_positions' => $openPositions,
            'total_applications' => $totalApplications,
            'total_departments' => $totalDepartments,
            'last_payroll_net' => $lastPayrollAmount,
            'last_payroll_month' => $lastPayrollLabel,
            'training_completion' => $trainingCompletion,
            'pending_approvals' => $pendingApprovals,
        ];
    }

    private function headcountByDept(): array
    {
        return Employee::where('employment_status', 'Active')
            ->with('department:id,name')
            ->get()
            ->groupBy(fn ($e) => $e->department?->name ?? 'Unassigned')
            ->map->count()
            ->sortDesc()->take(6)
            ->map(fn ($count, $name) => ['name' => $name, 'count' => $count])
            ->values()->toArray();
    }

    private function headcountTrend(): array
    {
        return collect(range(5, 0))->map(function ($i) {
            $date = now()->subMonths($i)->endOfMonth();

            return [
                'month' => $date->format('M'),
                'count' => Employee::where('employment_status', 'Active')
                    ->where('date_of_joining', '<=', $date)->count(),
            ];
        })->values()->toArray();
    }

    private function attendanceTrend(): array
    {
        return collect(range(6, 0))->map(function ($i) {
            $date = now()->subDays($i)->toDateString();

            return [
                'date' => Carbon::parse($date)->format('D'),
                'present' => Attendance::where('date', $date)->whereIn('status', ['present', 'late'])->count(),
                'absent' => Attendance::where('date', $date)->where('status', 'absent')->count(),
            ];
        })->values()->toArray();
    }

    private function leaveByType(): array
    {
        return LeaveRequest::where('status', 'approved')
            ->whereMonth('start_date', now()->month)
            ->whereYear('start_date', now()->year)
            ->with('leaveType:id,name')
            ->get()
            ->groupBy(fn ($r) => $r->leaveType?->name ?? 'Other')
            ->map->count()
            ->map(fn ($count, $name) => ['name' => $name, 'count' => $count])
            ->values()->toArray();
    }

    private function employmentTypes(): Collection
    {
        return Employee::where('employment_status', 'Active')
            ->select('contract_type', DB::raw('count(*) as count'))
            ->whereNotNull('contract_type')
            ->groupBy('contract_type')
            ->pluck('count', 'contract_type');
    }

    private function genderBreakdown(): Collection
    {
        return Employee::where('employment_status', 'Active')
            ->select('gender', DB::raw('count(*) as count'))
            ->whereNotNull('gender')
            ->groupBy('gender')
            ->pluck('count', 'gender');
    }

    private function recentActivity(): array
    {
        return AuditLog::with('user:id,name')
            ->orderByDesc('created_at')->take(8)->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'user' => $log->user_name,
                'action' => $log->action,
                'module' => $log->module,
                'description' => $log->description,
                'time' => $log->created_at->diffForHumans(),
            ])->toArray();
    }
}
