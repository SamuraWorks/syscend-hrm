<?php

namespace Modules\Reports\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\PayrollRun;
use App\Models\PerformanceCycle;
use App\Models\PerformanceRating;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Modules\Training\app\Models\TrainingCourse;
use Modules\Training\app\Models\TrainingEnrollment;
use Modules\Training\app\Models\TrainingSession;

class ReportController extends Controller
{
    // ─── Overview Dashboard ───────────────────────────────────────────────────

    public function index()
    {
        $totalEmployees = Employee::where('employment_status', 'Active')->count();
        $totalDepts = Department::count();
        $lastPayroll = PayrollRun::where('status', 'paid')->orderByDesc('year')->orderByDesc('month')->first();
        $openLeaves = LeaveRequest::where('status', 'pending')->count();

        // Headcount by department (top 6)
        $headcountByDept = Employee::where('employment_status', 'Active')
            ->with('department:id,name')
            ->get()
            ->groupBy(fn ($e) => $e->department?->name ?? 'Unassigned')
            ->map->count()
            ->sortDesc()
            ->take(6)
            ->map(fn ($count, $name) => ['name' => $name, 'value' => $count]);

        // Monthly headcount trend (last 6 months) — active employees hired before each month end
        $headcountTrend = collect(range(5, 0))->map(function ($i) {
            $date = now()->subMonths($i)->endOfMonth();
            $count = Employee::where('employment_status', 'Active')
                ->where('date_of_joining', '<=', $date)
                ->count();

            return ['month' => $date->format('M Y'), 'value' => $count];
        });

        // Payroll last 6 months
        $payrollTrend = PayrollRun::where('status', 'paid')
            ->orderByDesc('year')->orderByDesc('month')
            ->take(6)->get()->sortBy(fn ($r) => $r->year * 100 + $r->month)
            ->map(fn ($r) => [
                'month' => Carbon::create($r->year, $r->month)->format('M Y'),
                'gross' => $r->total_gross,
                'net' => $r->total_net,
                'deductions' => $r->total_deductions,
            ])->values();

        // Employment status breakdown
        $statusBreakdown = Employee::select('employment_status', DB::raw('count(*) as count'))
            ->groupBy('employment_status')
            ->pluck('count', 'employment_status');

        // Training completion rate
        $totalEnrollments = TrainingEnrollment::count();
        $completions = TrainingEnrollment::where('status', 'completed')->count();
        $completionRate = $totalEnrollments > 0 ? round($completions / $totalEnrollments * 100, 1) : 0;

        return Inertia::render('reports/Index', [
            'summary' => [
                'total_employees' => $totalEmployees,
                'total_departments' => $totalDepts,
                'last_payroll_net' => $lastPayroll?->total_net ?? 0,
                'last_payroll_month' => $lastPayroll ? Carbon::create($lastPayroll->year, $lastPayroll->month)->format('F Y') : null,
                'open_leaves' => $openLeaves,
                'training_completion' => $completionRate,
            ],
            'headcount_by_dept' => $headcountByDept->values(),
            'headcount_trend' => $headcountTrend->values(),
            'payroll_trend' => $payrollTrend,
            'status_breakdown' => $statusBreakdown,
        ]);
    }

    // ─── Headcount Report ─────────────────────────────────────────────────────

    public function headcount()
    {
        $byDept = Employee::select('department_id', 'employment_status', DB::raw('count(*) as count'))
            ->with('department:id,name')
            ->groupBy('department_id', 'employment_status')
            ->get()
            ->groupBy(fn ($r) => $r->department?->name ?? 'Unassigned')
            ->map(fn ($rows, $dept) => [
                'department' => $dept,
                'active' => $rows->where('employment_status', 'Active')->sum('count'),
                'inactive' => $rows->where('employment_status', '!=', 'Active')->sum('count'),
                'total' => $rows->sum('count'),
            ])->values();

        $byGender = Employee::select('gender', DB::raw('count(*) as count'))
            ->whereNotNull('gender')
            ->groupBy('gender')
            ->pluck('count', 'gender');

        $byEmploymentType = Employee::select('contract_type', DB::raw('count(*) as count'))
            ->whereNotNull('contract_type')
            ->groupBy('contract_type')
            ->pluck('count', 'contract_type');

        // Tenure buckets
        $tenureBuckets = ['< 1 year' => 0, '1–3 years' => 0, '3–5 years' => 0, '5+ years' => 0];
        Employee::where('employment_status', 'Active')->whereNotNull('date_of_joining')->get()
            ->each(function ($e) use (&$tenureBuckets) {
                $years = $e->date_of_joining->diffInYears(now());
                if ($years < 1) {
                    $tenureBuckets['< 1 year']++;
                } elseif ($years < 3) {
                    $tenureBuckets['1–3 years']++;
                } elseif ($years < 5) {
                    $tenureBuckets['3–5 years']++;
                } else {
                    $tenureBuckets['5+ years']++;
                }
            });

        // Recent hires (last 30 days)
        $recentHires = Employee::where('date_of_joining', '>=', now()->subDays(30))
            ->with('department:id,name', 'position:id,name')
            ->orderByDesc('date_of_joining')
            ->take(10)
            ->get()
            ->map(fn ($e) => [
                'name' => $e->first_name.' '.$e->last_name,
                'department' => $e->department?->name,
                'position' => $e->position?->name,
                'joined' => $e->date_of_joining->format('d M Y'),
            ]);

        return Inertia::render('reports/Headcount', compact('byDept', 'byGender', 'byEmploymentType', 'tenureBuckets', 'recentHires'));
    }

    // ─── Payroll Report ───────────────────────────────────────────────────────

    public function payroll(Request $request)
    {
        $year = (int) $request->input('year', now()->year);

        $runs = PayrollRun::whereYear('created_at', $year)
            ->orWhere('year', $year)
            ->orderBy('month')
            ->get()
            ->map(fn ($r) => [
                'month' => Carbon::create($r->year, $r->month)->format('F'),
                'month_num' => $r->month,
                'status' => $r->status,
                'employees' => $r->total_employees,
                'gross' => $r->total_gross,
                'deductions' => $r->total_deductions,
                'net' => $r->total_net,
            ]);

        $summary = [
            'total_gross' => $runs->sum('gross'),
            'total_net' => $runs->sum('net'),
            'total_deductions' => $runs->sum('deductions'),
            'avg_per_employee' => $runs->avg('net'),
            'runs_count' => $runs->count(),
        ];

        $availableYears = PayrollRun::selectRaw('year')->distinct()->orderByDesc('year')->pluck('year');

        return Inertia::render('reports/Payroll', compact('runs', 'summary', 'year', 'availableYears'));
    }

    // ─── Attendance Report ────────────────────────────────────────────────────

    public function attendance(Request $request)
    {
        $month = (int) $request->input('month', now()->month);
        $year = (int) $request->input('year', now()->year);

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        $workingDays = $startDate->diffInWeekdays($endDate) + 1;

        $byDept = Employee::where('employment_status', 'Active')
            ->with('department:id,name')
            ->withCount([
                'attendances as present_days' => fn ($q) => $q->whereBetween('date', [$startDate, $endDate])
                    ->where('status', 'present'),
                'attendances as late_days' => fn ($q) => $q->whereBetween('date', [$startDate, $endDate])
                    ->where('status', 'late'),
                'attendances as absent_days' => fn ($q) => $q->whereBetween('date', [$startDate, $endDate])
                    ->where('status', 'absent'),
            ])
            ->get()
            ->groupBy(fn ($e) => $e->department?->name ?? 'Unassigned')
            ->map(fn ($emps, $dept) => [
                'department' => $dept,
                'employees' => $emps->count(),
                'avg_present' => round($emps->avg('present_days'), 1),
                'avg_late' => round($emps->avg('late_days'), 1),
                'avg_absent' => round($emps->avg('absent_days'), 1),
                'attendance_rate' => $workingDays > 0
                    ? round($emps->avg('present_days') / $workingDays * 100, 1)
                    : 0,
            ])->values();

        // Daily attendance trend for the month
        $dailyTrend = Attendance::select('date', 'status', DB::raw('count(*) as count'))
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy('date', 'status')
            ->get()
            ->groupBy('date')
            ->map(fn ($rows, $date) => [
                'date' => Carbon::parse($date)->format('d M'),
                'present' => $rows->where('status', 'present')->first()?->count ?? 0,
                'late' => $rows->where('status', 'late')->first()?->count ?? 0,
                'absent' => $rows->where('status', 'absent')->first()?->count ?? 0,
            ])->values();

        return Inertia::render('reports/Attendance', compact('byDept', 'dailyTrend', 'month', 'year', 'workingDays'));
    }

    // ─── Leave Report ─────────────────────────────────────────────────────────

    public function leave(Request $request)
    {
        $year = (int) $request->input('year', now()->year);

        $byType = LeaveRequest::select('leave_type_id', 'status', DB::raw('count(*) as count'), DB::raw('sum(days) as total_days'))
            ->whereYear('start_date', $year)
            ->with('leaveType:id,name')
            ->groupBy('leave_type_id', 'status')
            ->get()
            ->groupBy(fn ($r) => $r->leaveType?->name ?? 'Unknown')
            ->map(fn ($rows, $type) => [
                'type' => $type,
                'approved' => (int) $rows->where('status', 'approved')->sum('count'),
                'pending' => (int) $rows->where('status', 'pending')->sum('count'),
                'rejected' => (int) $rows->where('status', 'rejected')->sum('count'),
                'total_days' => (float) $rows->where('status', 'approved')->sum('total_days'),
            ])->values();

        $byDept = LeaveRequest::select('employees.department_id', DB::raw('count(*) as count'), DB::raw('sum(leave_requests.days) as total_days'))
            ->join('employees', 'employees.id', '=', 'leave_requests.employee_id')
            ->whereYear('leave_requests.start_date', $year)
            ->where('leave_requests.status', 'approved')
            ->with('employee.department:id,name')
            ->groupBy('employees.department_id')
            ->get()
            ->map(fn ($r) => [
                'department' => Department::find($r->department_id)?->name ?? 'Unassigned',
                'requests' => (int) $r->count,
                'days' => (float) $r->total_days,
            ]);

        // Monthly leave trend
        $monthlyTrend = collect(range(1, 12))->map(function ($m) use ($year) {
            $rows = LeaveRequest::whereYear('start_date', $year)
                ->whereMonth('start_date', $m)
                ->where('status', 'approved')
                ->selectRaw('count(*) as requests, sum(days) as days')
                ->first();

            return [
                'month' => Carbon::create($year, $m)->format('M'),
                'requests' => (int) ($rows?->requests ?? 0),
                'days' => (float) ($rows?->days ?? 0),
            ];
        });

        $availableYears = LeaveRequest::pluck('start_date')
            ->map(fn ($d) => Carbon::parse($d)->year)
            ->unique()->sortDesc()->values();

        return Inertia::render('reports/Leave', compact('byType', 'byDept', 'monthlyTrend', 'year', 'availableYears'));
    }

    // ─── Training Report ──────────────────────────────────────────────────────

    public function training()
    {
        $byCourse = TrainingCourse::withCount([
            'sessions',
            'sessions as total_enrollments' => fn ($q) => $q->join('training_enrollments', 'training_enrollments.session_id', '=', 'training_sessions.id'),
            'sessions as completions' => fn ($q) => $q->join('training_enrollments', 'training_enrollments.session_id', '=', 'training_sessions.id')
                ->where('training_enrollments.status', 'completed'),
        ])
            ->where('status', 'active')
            ->get()
            ->map(fn ($c) => [
                'course' => $c->title,
                'category' => $c->category,
                'sessions' => $c->sessions_count,
                'total_enrollments' => $c->total_enrollments,
                'completions' => $c->completions,
                'completion_rate' => $c->total_enrollments > 0
                    ? round($c->completions / $c->total_enrollments * 100, 1)
                    : 0,
            ]);

        $byStatus = TrainingEnrollment::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $avgScore = TrainingEnrollment::where('status', 'completed')
            ->whereNotNull('score')
            ->avg('score');

        $byCategory = TrainingEnrollment::join('training_sessions', 'training_sessions.id', '=', 'training_enrollments.session_id')
            ->join('training_courses', 'training_courses.id', '=', 'training_sessions.course_id')
            ->select('training_courses.category', DB::raw('count(*) as enrollments'), DB::raw('sum(training_enrollments.status = "completed") as completions'))
            ->groupBy('training_courses.category')
            ->get()
            ->map(fn ($r) => [
                'category' => $r->category ?? 'Uncategorised',
                'enrollments' => (int) $r->enrollments,
                'completions' => (int) $r->completions,
                'completion_rate' => $r->enrollments > 0 ? round($r->completions / $r->enrollments * 100, 1) : 0,
            ]);

        $summary = [
            'total_courses' => TrainingCourse::where('status', 'active')->count(),
            'total_sessions' => TrainingSession::count(),
            'total_enrollments' => TrainingEnrollment::count(),
            'completions' => TrainingEnrollment::where('status', 'completed')->count(),
            'avg_score' => round($avgScore ?? 0, 1),
            'completion_rate' => TrainingEnrollment::count() > 0
                ? round(TrainingEnrollment::where('status', 'completed')->count() / TrainingEnrollment::count() * 100, 1)
                : 0,
        ];

        return Inertia::render('reports/Training', compact('byCourse', 'byStatus', 'byCategory', 'summary'));
    }

    // ─── Performance Report ───────────────────────────────────────────────────

    public function performance()
    {
        $cycles = PerformanceCycle::withCount('ratings')->orderByDesc('start_date')->get();

        $latestCycle = $cycles->first();

        $ratingsByLabel = PerformanceRating::whereNotNull('rating_label')
            ->select('rating_label', DB::raw('count(*) as count'))
            ->when($latestCycle, fn ($q) => $q->where('cycle_id', $latestCycle->id))
            ->groupBy('rating_label')
            ->pluck('count', 'rating_label');

        $byDept = PerformanceRating::join('employees', 'employees.id', '=', 'performance_ratings.employee_id')
            ->select('employees.department_id', DB::raw('avg(performance_ratings.final_score) as avg_score'), DB::raw('count(*) as count'))
            ->whereNotNull('performance_ratings.final_score')
            ->when($latestCycle, fn ($q) => $q->where('performance_ratings.cycle_id', $latestCycle->id))
            ->groupBy('employees.department_id')
            ->get()
            ->map(fn ($r) => [
                'department' => Department::find($r->department_id)?->name ?? 'Unassigned',
                'avg_score' => round((float) $r->avg_score, 2),
                'count' => (int) $r->count,
            ]);

        $cycleSummaries = $cycles->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'status' => $c->status,
            'start_date' => $c->start_date->format('d M Y'),
            'end_date' => $c->end_date->format('d M Y'),
            'ratings_count' => $c->ratings_count,
            'avg_score' => round((float) PerformanceRating::where('cycle_id', $c->id)->whereNotNull('final_score')->avg('final_score') ?? 0, 2),
        ]);

        return Inertia::render('reports/Performance', compact('cycleSummaries', 'ratingsByLabel', 'byDept', 'latestCycle'));
    }
}
