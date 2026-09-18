<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\InterviewSchedule;
use App\Models\JobApplication;
use App\Models\JobPosting;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\PayrollRun;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Modules\SystemAdmin\app\Models\AuditLog;
use Modules\Training\app\Models\TrainingEnrollment;

class PortalController extends Controller
{
    private const ROLE_MAP = [
        'Admin' => 'admin',
        'HR Manager' => 'hr',
        'Manager' => 'manager',
        'Employee' => 'employee',
        'Recruiter' => 'recruiter',
        'Finance' => 'finance',
    ];

    private const PAGE = [
        'employee' => 'portal/Employee',
        'manager' => 'portal/Manager',
        'hr' => 'portal/Hr',
        'recruiter' => 'portal/Recruiter',
        'finance' => 'portal/Finance',
        'admin' => 'portal/Admin',
    ];

    // ─── Entry points ───────────────────────────────────────────────────────────

    public function redirect(Request $request)
    {
        if ($this->isSyscendOps($request->user())) {
            return redirect()->route('syscend.dashboard');
        }

        return redirect()->route('portal.show', ['portal' => $this->portalSlug($request->user())]);
    }

    public function show(string $portal, Request $request)
    {
        $user = $request->user();

        if ($this->isSyscendOps($user)) {
            return redirect()->route('syscend.dashboard');
        }

        $slug = $this->portalSlug($user);

        // Only allow a user into their own portal; bounce them to the right one.
        if ($portal !== $slug) {
            return redirect()->route('portal.show', ['portal' => $slug]);
        }

        $data = match ($slug) {
            'employee' => $this->employeePortal($user),
            'manager' => $this->managerPortal($user),
            'hr' => $this->hrPortal($user),
            'recruiter' => $this->recruiterPortal($user),
            'finance' => $this->financePortal($user),
            'admin' => $this->adminPortal($user),
        };

        return Inertia::render(self::PAGE[$slug], ['portal' => $data]);
    }

    private function portalSlug($user): string
    {
        foreach ($user->getRoleNames() as $name) {
            if (isset(self::ROLE_MAP[$name])) {
                return self::ROLE_MAP[$name];
            }
        }

        return 'employee';
    }

    private function isSyscendOps($user): bool
    {
        foreach ($user->getRoleNames() as $name) {
            if ($name === 'Syscend Admin') {
                return true;
            }
        }

        return false;
    }

    // ─── Employee portal ────────────────────────────────────────────────────────

    private function employeePortal($user): ?array
    {
        $emp = Employee::where('user_id', $user->id)
            ->with(['department:id,name', 'position:id,name'])
            ->first();

        if (! $emp) {
            return null;
        }

        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd = now()->endOfMonth()->toDateString();

        $todayAtt = Attendance::where('employee_id', $emp->id)->where('date', $today)->first();

        $worked = Attendance::where('employee_id', $emp->id)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->whereIn('status', ['present', 'late'])->count();
        $late = Attendance::where('employee_id', $emp->id)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->where('status', 'late')->count();
        $absent = Attendance::where('employee_id', $emp->id)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->where('status', 'absent')->count();

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

        $leaveBalances = LeaveBalance::where('employee_id', $emp->id)
            ->where('year', now()->year)
            ->with('leaveType:id,name,color')
            ->get()
            ->map(fn ($b) => [
                'type' => $b->leaveType?->name ?? '—',
                'color' => $b->leaveType?->color ?? '#6b7280',
                'entitled' => $b->entitled,
                'used' => $b->used,
                'pending' => $b->pending,
                'available' => max(0, $b->entitled + $b->carried_forward - $b->used - $b->pending),
            ]);

        $myLeaves = LeaveRequest::where('employee_id', $emp->id)
            ->with('leaveType:id,name,color')
            ->orderByDesc('created_at')->take(5)
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

        $trainings = TrainingEnrollment::where('employee_id', $emp->id)
            ->with('session.course:id,title')
            ->orderByDesc('created_at')->take(4)
            ->get()
            ->map(fn ($e) => ['course' => $e->session?->course?->title ?? '—', 'status' => $e->status]);

        $nextLeave = LeaveRequest::where('employee_id', $emp->id)
            ->where('status', 'approved')
            ->where('start_date', '>=', $today)
            ->orderBy('start_date')->first();

        $tenureMonths = $emp->date_of_joining
            ? (int) now()->diffInMonths(Carbon::parse($emp->date_of_joining))
            : null;

        return [
            'name' => $emp->first_name.' '.$emp->last_name,
            'employee_id' => $emp->employee_id,
            'department' => $emp->department?->name,
            'position' => $emp->position?->name,
            'date_of_joining' => $emp->date_of_joining?->format('d M Y'),
            'tenure_label' => $tenureMonths !== null
                ? ($tenureMonths < 12
                    ? $tenureMonths.' month'.($tenureMonths !== 1 ? 's' : '').' tenure'
                    : floor($tenureMonths / 12).' yr'.(floor($tenureMonths / 12) !== 1 ? 's' : '')
                      .($tenureMonths % 12 > 0 ? ' '.($tenureMonths % 12).'mo' : '').' tenure')
                : null,
            'today_att' => $todayAtt ? [
                'status' => $todayAtt->status,
                'check_in' => $todayAtt->check_in,
                'check_out' => $todayAtt->check_out,
                'worked_minutes' => $todayAtt->worked_minutes,
            ] : null,
            'month_stats' => [
                'worked' => $worked, 'late' => $late, 'absent' => $absent,
                'total' => now()->daysInMonth,
                'rate' => now()->daysInMonth > 0 ? round($worked / now()->daysInMonth * 100, 1) : 0,
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

    // ─── Manager portal ─────────────────────────────────────────────────────────

    private function managerPortal($user): array
    {
        $emp = Employee::where('user_id', $user->id)->with('department:id,name')->first();
        $team = $emp ? Employee::where('reporting_manager_id', $emp->id)->get() : collect();
        $ids = $team->pluck('id');
        $today = now()->toDateString();

        $presentToday = Attendance::whereIn('employee_id', $ids)->where('date', $today)->whereIn('status', ['present', 'late'])->count();
        $absentToday = Attendance::whereIn('employee_id', $ids)->where('date', $today)->where('status', 'absent')->count();
        $onLeave = LeaveRequest::whereIn('employee_id', $ids)
            ->where('status', 'approved')
            ->where('start_date', '<=', $today)->where('end_date', '>=', $today)->count();
        $pending = LeaveRequest::whereIn('employee_id', $ids)->where('status', 'pending')->count();

        $byPosition = Employee::where('reporting_manager_id', $emp?->id)
            ->with('position:id,name')
            ->get()
            ->groupBy(fn ($e) => $e->position?->name ?? 'Unassigned')
            ->map->count()
            ->sortDesc()
            ->map(fn ($count, $name) => ['name' => $name, 'count' => $count])
            ->values()->toArray();

        $pendingApprovals = LeaveRequest::whereIn('employee_id', $ids)
            ->where('status', 'pending')
            ->with(['employee:id,first_name,last_name', 'leaveType:id,name'])
            ->orderBy('created_at')->take(6)
            ->get()
            ->map(fn ($r) => $this->leaveRow($r));

        $teamLeaves = LeaveRequest::whereIn('employee_id', $ids)
            ->with(['employee:id,first_name,last_name', 'leaveType:id,name'])
            ->orderByDesc('created_at')->take(6)
            ->get()
            ->map(fn ($r) => $this->leaveRow($r));

        $teamTotal = $team->count();

        return [
            'subtitle' => $emp?->department?->name
                ? "Here's what's happening across {$emp->department->name} today."
                : "Here's what's happening across your team today.",
            'team_total' => $teamTotal,
            'team_active' => $team->where('employment_status', 'Active')->count(),
            'present_today' => $presentToday,
            'absent_today' => $absentToday,
            'on_leave_today' => $onLeave,
            'pending_leaves' => $pending,
            'attendance_rate' => $teamTotal > 0 ? round($presentToday / $teamTotal * 100, 1) : 0,
            'department' => $emp?->department?->name,
            'team_by_position' => $byPosition,
            'pending_approvals' => $pendingApprovals,
            'team_leaves' => $teamLeaves,
        ];
    }

    // ─── HR portal ──────────────────────────────────────────────────────────────

    private function hrPortal($user): array
    {
        return [
            'subtitle' => "Here's what's happening across your organization today.",
            'stats' => $this->orgStats(),
            'pending_leaves' => LeaveRequest::where('status', 'pending')
                ->with(['employee:id,first_name,last_name', 'leaveType:id,name'])
                ->orderBy('created_at')->take(6)
                ->get()
                ->map(fn ($r) => $this->leaveRow($r)),
            'recent_activity' => $this->recentActivity(),
            'headcount_by_dept' => $this->headcountByDept(),
        ];
    }

    // ─── Recruiter portal ───────────────────────────────────────────────────────

    private function recruiterPortal($user): array
    {
        $openPositions = JobPosting::where('status', 'open')->count();
        $applications = JobApplication::count();
        $newApplications = JobApplication::where('created_at', '>=', now()->subDays(30))->count();
        $shortlisted = JobApplication::whereIn('stage', ['shortlisted', 'interviewed', 'offered'])->count();

        $activeInterviews = InterviewSchedule::where('scheduled_at', '>=', now())->count()
            + JobApplication::where('stage', 'interviewed')->count();

        $byStage = JobApplication::select('stage', DB::raw('count(*) as total'))
            ->groupBy('stage')
            ->orderByDesc('total')
            ->pluck('total', 'stage')
            ->map(fn ($count, $name) => ['name' => $name, 'count' => $count])
            ->values();

        $recent = JobApplication::with('jobPosting:id,title')
            ->orderByDesc('created_at')->take(6)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'name' => $a->first_name.' '.$a->last_name,
                'job' => $a->jobPosting?->title ?? '—',
                'stage' => $a->stage,
                'updated_at' => $a->updated_at?->diffForHumans(),
            ]);

        $openJobs = JobPosting::where('status', 'open')
            ->with('department:id,name')->withCount('applications')
            ->orderByDesc('created_at')->take(6)
            ->get()
            ->map(fn ($j) => [
                'id' => $j->id,
                'title' => $j->title,
                'department' => $j->department?->name,
                'applications' => $j->applications_count,
                'deadline' => $j->deadline?->format('d M Y'),
            ]);

        return [
            'subtitle' => 'Track your hiring pipeline and grow the team.',
            'open_positions' => $openPositions,
            'total_applications' => $applications,
            'new_applications' => $newApplications,
            'shortlisted' => $shortlisted,
            'active_interviews' => $activeInterviews,
            'applications_by_stage' => $byStage,
            'recent_applications' => $recent,
            'open_jobs' => $openJobs,
        ];
    }

    // ─── Finance portal ─────────────────────────────────────────────────────────

    private function financePortal($user): array
    {
        $latest = PayrollRun::orderByDesc('year')->orderByDesc('month')->first();

        $runs = PayrollRun::selectRaw('
                count(*) as total,
                sum(case when status = "paid" then 1 else 0 end) as paid,
                sum(case when status = "approved" then 1 else 0 end) as approved,
                sum(case when status = "draft" then 1 else 0 end) as draft,
                sum(case when status = "paid" and year = '.now()->year.' then total_net else 0 end) as ytd_net
            ')->first();

        $recentRuns = PayrollRun::orderByDesc('year')->orderByDesc('month')->take(6)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'title' => $r->title,
                'month_year' => $r->year ? Carbon::create($r->year, $r->month ?? 1)->format('M Y') : '—',
                'total_net' => $this->money($r->total_net),
                'total_employees' => $r->total_employees,
                'status' => $r->status,
            ]);

        return [
            'subtitle' => 'Payroll control center and financial summaries.',
            'ytd_net' => $this->money($runs->ytd_net ?? 0),
            'total_runs' => (int) ($runs->total ?? 0),
            'draft_runs' => (int) ($runs->draft ?? 0),
            'approved_runs' => (int) ($runs->approved ?? 0),
            'paid_runs' => (int) ($runs->paid ?? 0),
            'total_staff' => $latest?->total_employees ?? Employee::where('employment_status', 'Active')->count(),
            'latest_run' => $latest ? [
                'title' => $latest->title,
                'month_year' => $latest->year ? Carbon::create($latest->year, $latest->month ?? 1)->format('M Y') : '—',
                'total_net' => $this->money($latest->total_net),
                'total_gross' => $this->money($latest->total_gross),
                'total_employees' => $latest->total_employees,
                'status' => $latest->status,
            ] : null,
            'recent_runs' => $recentRuns,
        ];
    }

    // ─── Admin portal ───────────────────────────────────────────────────────────

    private function adminPortal($user): array
    {
        $stats = $this->orgStats();

        return [
            'subtitle' => 'System overview, configuration, and platform health.',
            'stats' => $stats,
            'system' => [
                'users' => User::count(),
                'roles' => DB::table('roles')->count(),
                'permissions' => DB::table('permissions')->count(),
                'audit_logs' => AuditLog::count(),
                'last_login' => null,
            ],
            'license' => [
                'enabled' => (bool) config('license.enabled', false),
                'holder' => config('license.holder'),
                'key_provided' => (bool) config('license.key'),
                'status' => config('license.enabled', false) ? 'active' : 'not enforced',
            ],
            'early_warnings' => [
                'no_users' => User::count() === 0,
                'no_departments' => Department::count() === 0,
                'no_employees' => Employee::where('employment_status', 'Active')->count() === 0,
            ],
            'recent_activity' => $this->recentActivity(),
        ];
    }

    // ─── Shared helpers ─────────────────────────────────────────────────────────

    private function leaveRow($r): array
    {
        return [
            'id' => $r->id,
            'name' => $r->employee ? ($r->employee->first_name.' '.$r->employee->last_name) : '—',
            'type' => $r->leaveType?->name ?? '—',
            'start_date' => $r->start_date?->format('d M Y'),
            'end_date' => $r->end_date?->format('d M Y'),
            'days' => $r->days,
            'status' => $r->status,
        ];
    }

    private function money($value): string
    {
        return 'Le '.number_format((float) $value, 0);
    }

    private function orgStats(): array
    {
        $totalEmployees = Employee::where('employment_status', 'Active')->count();
        $presentToday = Attendance::where('date', now()->toDateString())->whereIn('status', ['present', 'late'])->count();

        return [
            'total_employees' => $totalEmployees,
            'new_this_month' => Employee::where('employment_status', 'Active')
                ->whereMonth('date_of_joining', now()->month)
                ->whereYear('date_of_joining', now()->year)->count(),
            'present_today' => $presentToday,
            'attendance_rate' => $totalEmployees > 0 ? round($presentToday / $totalEmployees * 100, 1) : 0,
            'on_leave_today' => LeaveRequest::where('status', 'approved')
                ->where('start_date', '<=', now()->toDateString())->where('end_date', '>=', now()->toDateString())->count(),
            'pending_leaves' => LeaveRequest::where('status', 'pending')->count(),
            'open_positions' => JobPosting::where('status', 'open')->count(),
            'total_applications' => JobApplication::count(),
            'total_departments' => Department::count(),
            'last_payroll_net' => $this->money($this->lastPayroll()?->total_net),
            'last_payroll_month' => $this->lastPayrollMonth(),
            'training_completion' => TrainingEnrollment::count() > 0
                ? round(TrainingEnrollment::where('status', 'completed')->count() / TrainingEnrollment::count() * 100, 1)
                : 0,
        ];
    }

    private function lastPayroll(): ?PayrollRun
    {
        return PayrollRun::where('status', 'paid')->orderByDesc('year')->orderByDesc('month')->first();
    }

    private function lastPayrollMonth(): ?string
    {
        $run = $this->lastPayroll();

        return $run && $run->year ? Carbon::create($run->year, $run->month ?? 1)->format('M Y') : null;
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
            ])->values()->toArray();
    }
}
