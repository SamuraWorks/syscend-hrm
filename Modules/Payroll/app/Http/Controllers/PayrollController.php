<?php

namespace Modules\Payroll\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\PayrollRun;
use App\Models\Payslip;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Modules\Payroll\app\Services\PayrollService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PayrollController extends Controller
{
    public function index()
    {
        $runs = PayrollRun::with('runner')->orderByDesc('year')->orderByDesc('month')->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'title' => $r->title,
                'month' => $r->month,
                'year' => $r->year,
                'status' => $r->status,
                'total_employees' => $r->total_employees,
                'total_gross' => $r->total_gross,
                'total_deductions' => $r->total_deductions,
                'total_net' => $r->total_net,
                'run_by' => $r->runner?->name,
                'created_at' => $r->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('payroll/Index', compact('runs'));
    }

    public function create()
    {
        return Inertia::render('payroll/runs/Create', [
            'months' => collect(range(1, 12))->map(fn ($m) => [
                'value' => $m,
                'label' => Carbon::create(null, $m)->format('F'),
            ]),
            'current_month' => (int) now()->format('m'),
            'current_year' => (int) now()->format('Y'),
        ]);
    }

    public function store(Request $request, PayrollService $service)
    {
        $data = $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020|max:2099',
            'notes' => 'nullable|string|max:500',
        ]);

        if (PayrollRun::where('month', $data['month'])->where('year', $data['year'])->exists()) {
            return back()->withErrors(['month' => 'A payroll run for this month already exists.']);
        }

        $run = PayrollRun::create([
            'month' => $data['month'],
            'year' => $data['year'],
            'title' => Carbon::create($data['year'], $data['month'])->format('F Y').' Payroll',
            'status' => 'draft',
            'run_by' => $request->user()->id,
            'notes' => $data['notes'] ?? null,
        ]);

        $service->generate($run);

        return redirect("/payroll/runs/{$run->id}")->with('success', 'Payroll run generated.');
    }

    public function show(PayrollRun $run)
    {
        $payslips = $run->payslips()->with(['employee', 'lines'])->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'employee_id' => $p->employee_id,
                'employee_name' => $p->employee->first_name.' '.$p->employee->last_name,
                'employee_code' => $p->employee->employee_id,
                'department' => $p->employee->department?->name,
                'basic_salary' => $p->basic_salary,
                'gross_salary' => $p->gross_salary,
                'total_earnings' => $p->total_earnings,
                'total_deductions' => $p->total_deductions,
                'tax_amount' => $p->tax_amount,
                'net_salary' => $p->net_salary,
                'working_days' => $p->working_days,
                'paid_days' => $p->paid_days,
                'status' => $p->status,
                'lines' => $p->lines->map(fn ($l) => [
                    'name' => $l->component_name,
                    'type' => $l->component_type,
                    'amount' => $l->amount,
                ]),
            ]);

        return Inertia::render('payroll/runs/Show', [
            'run' => [
                'id' => $run->id,
                'title' => $run->title,
                'month' => $run->month,
                'year' => $run->year,
                'status' => $run->status,
                'total_employees' => $run->total_employees,
                'total_gross' => $run->total_gross,
                'total_deductions' => $run->total_deductions,
                'total_net' => $run->total_net,
            ],
            'payslips' => $payslips,
        ]);
    }

    public function approve(PayrollRun $run)
    {
        abort_if($run->status !== 'draft', 403, 'Only draft runs can be approved.');
        $run->update(['status' => 'approved', 'approved_by' => request()->user()->id]);

        return back()->with('success', 'Payroll approved.');
    }

    public function markPaid(PayrollRun $run)
    {
        abort_if($run->status !== 'approved', 403, 'Only approved runs can be marked paid.');
        $run->update(['status' => 'paid']);
        $run->payslips()->update(['status' => 'paid', 'paid_at' => now()]);

        return back()->with('success', 'Payroll marked as paid.');
    }

    public function destroy(PayrollRun $run)
    {
        abort_if($run->status !== 'draft', 403, 'Only draft runs can be deleted.');
        $run->delete();

        return redirect('/payroll')->with('success', 'Payroll run deleted.');
    }

    public function regenerate(PayrollRun $run, PayrollService $service)
    {
        abort_if($run->status !== 'draft', 403, 'Only draft runs can be regenerated.');
        $service->generate($run);

        return back()->with('success', 'Payroll regenerated.');
    }

    public function exportRun(PayrollRun $run): StreamedResponse
    {
        $payslips = $run->payslips()
            ->with(['employee.department', 'employee.position'])
            ->get();

        $filename = 'payroll-'.Str::slug($run->title).'-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($payslips) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM so Excel opens Léones/polyglot names correctly
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'Employee ID', 'Employee Name', 'Department', 'Position',
                'Basic Salary', 'Gross Salary', 'Total Earnings', 'Total Deductions',
                'Tax', 'Net Salary', 'Working Days', 'Paid Days', 'Status',
            ]);

            foreach ($payslips as $p) {
                fputcsv($handle, [
                    $p->employee->employee_id,
                    $p->employee->first_name.' '.$p->employee->last_name,
                    $p->employee->department?->name,
                    $p->employee->position?->name,
                    $p->basic_salary,
                    $p->gross_salary,
                    $p->total_earnings,
                    $p->total_deductions,
                    $p->tax_amount,
                    $p->net_salary,
                    $p->working_days,
                    $p->paid_days,
                    $p->status,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function showPayslip(Request $request, PayrollRun $run, Payslip $payslip)
    {
        abort_if($payslip->payroll_run_id !== $run->id, 404);

        $canManage = $request->user()->hasAnyPermission(['payroll.view', 'employees.create']);
        if (! $canManage) {
            $myEmployee = Employee::where('user_id', $request->user()->id)->first();
            abort_if(! $myEmployee || $payslip->employee_id !== $myEmployee->id, 403);
        }
        $payslip->load(['employee.department', 'employee.position', 'lines']);

        $monthName = Carbon::create($run->year, $run->month)->format('F Y');

        return Inertia::render('payroll/payslips/Show', [
            'run' => [
                'id' => $run->id,
                'title' => $run->title,
                'month' => $run->month,
                'year' => $run->year,
                'status' => $run->status,
            ],
            'payslip' => [
                'id' => $payslip->id,
                'period' => $monthName,
                'employee_name' => $payslip->employee->first_name.' '.$payslip->employee->last_name,
                'employee_code' => $payslip->employee->employee_id,
                'department' => $payslip->employee->department?->name,
                'position' => $payslip->employee->position?->name,
                'email' => $payslip->employee->email,
                'joining_date' => $payslip->employee->date_of_joining?->format('d M Y'),
                'basic_salary' => $payslip->basic_salary,
                'gross_salary' => $payslip->gross_salary,
                'total_earnings' => $payslip->total_earnings,
                'total_deductions' => $payslip->total_deductions,
                'tax_amount' => $payslip->tax_amount,
                'net_salary' => $payslip->net_salary,
                'working_days' => $payslip->working_days,
                'paid_days' => $payslip->paid_days,
                'status' => $payslip->status,
                'paid_at' => $payslip->paid_at?->format('d M Y'),
                'earnings' => $payslip->lines->where('component_type', 'earning')->values()->map(fn ($l) => ['name' => $l->component_name, 'amount' => $l->amount]),
                'deductions' => $payslip->lines->where('component_type', 'deduction')->values()->map(fn ($l) => ['name' => $l->component_name, 'amount' => $l->amount]),
                'taxes' => $payslip->lines->where('component_type', 'tax')->values()->map(fn ($l) => ['name' => $l->component_name, 'amount' => $l->amount]),
            ],
        ]);
    }
}
