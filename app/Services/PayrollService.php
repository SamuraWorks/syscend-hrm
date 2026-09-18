<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeSalary;
use App\Models\PayrollRun;
use App\Models\Payslip;
use App\Models\PayslipLine;
use Carbon\Carbon;

class PayrollService
{
    /**
     * Generate payslips for all eligible employees for this payroll run.
     */
    public function generate(PayrollRun $run): void
    {
        $daysInMonth = Carbon::create($run->year, $run->month)->daysInMonth;

        // Get latest active salary assignment per employee
        $salaryAssignments = EmployeeSalary::with(['employee', 'structure.components'])
            ->whereHas('employee', fn ($q) => $q->where('employment_status', 'Active'))
            ->where('effective_date', '<=', Carbon::create($run->year, $run->month)->endOfMonth())
            ->orderByDesc('effective_date')
            ->get()
            ->unique('employee_id');   // keep latest per employee

        $totalGross = 0;
        $totalDeductions = 0;
        $totalNet = 0;
        $totalEmployees = 0;

        foreach ($salaryAssignments as $assignment) {
            $basic = (float) $assignment->basic_salary;
            $structure = $assignment->structure;

            $earnings = [];
            $deductions = [];
            $taxes = [];

            if ($structure) {
                // Pass 1: fixed + percentage_of_basic
                $grossBeforePoG = $basic;
                foreach ($structure->components as $comp) {
                    $effectiveValue = $comp->pivot->override_value ?? $comp->value;
                    $amount = match ($comp->calculation_type) {
                        'fixed' => (float) $effectiveValue,
                        'percentage_of_basic' => round($basic * $effectiveValue / 100, 2),
                        default => 0,
                    };
                    if ($comp->type === 'earning') {
                        $earnings[] = [$comp, $amount];
                        $grossBeforePoG += $amount;
                    }
                    if ($comp->type === 'deduction') {
                        $deductions[] = [$comp, $amount];
                    }
                    if ($comp->type === 'tax') {
                        $taxes[] = [$comp, $amount];
                    }
                }

                // Pass 2: percentage_of_gross (uses gross after pass 1)
                foreach ($structure->components as $comp) {
                    if ($comp->calculation_type !== 'percentage_of_gross') {
                        continue;
                    }
                    $effectiveValue = $comp->pivot->override_value ?? $comp->value;
                    $amount = round($grossBeforePoG * $effectiveValue / 100, 2);
                    if ($comp->type === 'earning') {
                        $earnings[] = [$comp, $amount];
                    }
                    if ($comp->type === 'deduction') {
                        $deductions[] = [$comp, $amount];
                    }
                    if ($comp->type === 'tax') {
                        $taxes[] = [$comp, $amount];
                    }
                }
            }

            $totalEarningsAmt = array_sum(array_column($earnings, 1));
            $totalDeductionsAmt = array_sum(array_column($deductions, 1));
            $taxAmt = array_sum(array_column($taxes, 1));
            $gross = round($basic + $totalEarningsAmt, 2);
            $net = round($gross - $totalDeductionsAmt - $taxAmt, 2);

            // Create/update payslip
            $payslip = Payslip::updateOrCreate(
                ['payroll_run_id' => $run->id, 'employee_id' => $assignment->employee_id],
                [
                    'basic_salary' => $basic,
                    'gross_salary' => $gross,
                    'total_earnings' => $totalEarningsAmt,
                    'total_deductions' => $totalDeductionsAmt,
                    'tax_amount' => $taxAmt,
                    'net_salary' => $net,
                    'working_days' => $daysInMonth,
                    'paid_days' => $daysInMonth,
                    'status' => 'pending',
                ],
            );

            // Regenerate lines
            $payslip->lines()->delete();
            foreach ($earnings as [$comp, $amount]) {
                PayslipLine::create([
                    'payslip_id' => $payslip->id,
                    'salary_component_id' => $comp->id,
                    'component_name' => $comp->name,
                    'component_type' => 'earning',
                    'amount' => $amount,
                ]);
            }
            foreach ($deductions as [$comp, $amount]) {
                PayslipLine::create([
                    'payslip_id' => $payslip->id,
                    'salary_component_id' => $comp->id,
                    'component_name' => $comp->name,
                    'component_type' => 'deduction',
                    'amount' => $amount,
                ]);
            }
            foreach ($taxes as [$comp, $amount]) {
                PayslipLine::create([
                    'payslip_id' => $payslip->id,
                    'salary_component_id' => $comp->id,
                    'component_name' => $comp->name,
                    'component_type' => 'tax',
                    'amount' => $amount,
                ]);
            }

            $totalGross += $gross;
            $totalDeductions += ($totalDeductionsAmt + $taxAmt);
            $totalNet += $net;
            $totalEmployees++;
        }

        $run->update([
            'total_employees' => $totalEmployees,
            'total_gross' => round($totalGross, 2),
            'total_deductions' => round($totalDeductions, 2),
            'total_net' => round($totalNet, 2),
        ]);
    }
}
