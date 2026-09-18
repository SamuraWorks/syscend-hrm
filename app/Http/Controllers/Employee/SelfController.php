<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Payslip;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Modules\Documents\app\Models\CompanyDocument;
use Modules\Documents\app\Models\DocumentAcknowledgement;
use Modules\Documents\app\Models\EmployeeDocument;

class SelfController extends Controller
{
    // ── My Payslips ─────────────────────────────────────────────────────────

    public function payslips()
    {
        $employee = Employee::where('user_id', Auth::id())->first();

        if (! $employee) {
            return Inertia::render('my/Payslips', [
                'payslips' => [],
                'hasEmployee' => false,
            ]);
        }

        $payslips = Payslip::where('employee_id', $employee->id)
            ->with('payrollRun:id,month,year,status')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'payroll_run_id' => $p->payroll_run_id,
                'month' => $p->payrollRun?->month,
                'year' => $p->payrollRun?->year,
                'month_label' => $p->payrollRun
                    ? Carbon::create($p->payrollRun->year, $p->payrollRun->month)->format('F Y')
                    : '—',
                'basic_salary' => (float) $p->basic_salary,
                'gross_salary' => (float) $p->gross_salary,
                'total_earnings' => (float) $p->total_earnings,
                'total_deductions' => (float) $p->total_deductions,
                'tax_amount' => (float) $p->tax_amount,
                'net_salary' => (float) $p->net_salary,
                'working_days' => $p->working_days,
                'paid_days' => $p->paid_days,
                'status' => $p->status,
                'paid_at' => $p->paid_at?->format('d M Y'),
            ]);

        return Inertia::render('my/Payslips', [
            'payslips' => $payslips,
            'hasEmployee' => true,
            'employee' => [
                'name' => $employee->first_name.' '.$employee->last_name,
                'employee_id' => $employee->employee_id,
            ],
        ]);
    }

    // ── My Documents ─────────────────────────────────────────────────────────

    public function documents()
    {
        $employee = Employee::where('user_id', Auth::id())->first();

        // Personal HR documents uploaded by HR for this employee
        $myDocs = $employee
            ? EmployeeDocument::where('employee_id', $employee->id)
                ->orderByDesc('created_at')
                ->get()
                ->map(fn ($d) => [
                    'id' => $d->id,
                    'type' => 'personal',
                    'title' => $d->title ?? $d->file_name,
                    'category' => $d->category ?? 'General',
                    'file_name' => $d->file_name,
                    'file_size' => $d->file_size,
                    'expiry_date' => isset($d->expiry_date) ? Carbon::parse($d->expiry_date)->format('d M Y') : null,
                    'created_at' => $d->created_at->format('d M Y'),
                    'download_url' => "/employee-documents/{$d->id}/download",
                ])
            : collect();

        // Company-wide documents visible to all employees
        $companyDocs = CompanyDocument::where('status', 'active')
            ->where('visibility', 'all')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'type' => 'company',
                'title' => $d->title,
                'category' => $d->category,
                'file_name' => $d->file_name,
                'file_size' => $d->file_size,
                'description' => $d->description,
                'expiry_date' => $d->expiry_date?->format('d M Y'),
                'created_at' => $d->created_at->format('d M Y'),
                'download_url' => "/documents/{$d->id}/download",
                'acknowledged' => $employee
                    ? DocumentAcknowledgement::where('document_id', $d->id)
                        ->where('employee_id', $employee->id)->exists()
                    : false,
            ]);

        return Inertia::render('my/Documents', [
            'myDocs' => $myDocs,
            'companyDocs' => $companyDocs,
            'hasEmployee' => $employee !== null,
        ]);
    }
}
