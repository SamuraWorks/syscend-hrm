<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\PayrollRun;
use App\Models\Payslip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollController extends ApiController
{
    /**
     * List payroll runs — paginated with filters.
     */
    public function runs(Request $request): JsonResponse
    {
        $query = PayrollRun::withCount('payslips')
            ->when($request->year, fn ($q, $v) => $q->where('year', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('year')
            ->orderByDesc('month');

        return $this->paginated($query->paginate(15));
    }

    /**
     * Show a single payroll run with payslips count.
     */
    public function showRun(PayrollRun $run): JsonResponse
    {
        return $this->success($run->loadCount('payslips'));
    }

    /**
     * List payslips — paginated with filters.
     */
    public function payslips(Request $request): JsonResponse
    {
        $query = Payslip::with('employee:id,first_name,last_name,employee_id')
            ->when($request->run_id, fn ($q, $v) => $q->where('payroll_run_id', $v))
            ->when($request->employee_id, fn ($q, $v) => $q->where('employee_id', $v))
            ->orderByDesc('created_at');

        return $this->paginated($query->paginate(15));
    }

    /**
     * Show a single payslip with items, employee, and run.
     */
    public function showPayslip(Payslip $payslip): JsonResponse
    {
        return $this->success(
            $payslip->load(['lines', 'employee:id,first_name,last_name,employee_id', 'payrollRun'])
        );
    }
}
