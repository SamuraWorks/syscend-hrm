<?php

use Illuminate\Support\Facades\Route;
use Modules\Payroll\app\Http\Controllers\EmployeeSalaryController;
use Modules\Payroll\app\Http\Controllers\PayrollController;
use Modules\Payroll\app\Http\Controllers\SalaryComponentController;
use Modules\Payroll\app\Http\Controllers\SalaryStructureController;

Route::middleware(['auth', 'permission:payroll.view'])->group(function () {
    Route::get('/payroll', [PayrollController::class, 'index'])->name('payroll.index');
    Route::get('/payroll/runs/{run}', [PayrollController::class, 'show'])->name('payroll.runs.show')->whereNumber('run');
    Route::get('/payroll/runs/{run}/export', [PayrollController::class, 'exportRun'])->name('payroll.runs.export');
    Route::resource('/payroll/components', SalaryComponentController::class)->only(['index'])->parameters(['components' => 'component']);
    Route::resource('/payroll/structures', SalaryStructureController::class)->only(['index'])->parameters(['structures' => 'structure']);
    Route::get('/payroll/salaries', [EmployeeSalaryController::class, 'index'])->name('payroll.salaries.index');
});

// Auth-only — employees can view their own payslip; managers can view any
Route::middleware(['auth'])->group(function () {
    Route::get('/payroll/runs/{run}/payslips/{payslip}', [PayrollController::class, 'showPayslip'])->name('payroll.payslips.show');
});
Route::middleware(['auth', 'permission:payroll.process'])->group(function () {
    Route::get('/payroll/runs/create', [PayrollController::class, 'create'])->name('payroll.runs.create');
    Route::post('/payroll/runs', [PayrollController::class, 'store'])->name('payroll.runs.store');
    Route::post('/payroll/runs/{run}/regenerate', [PayrollController::class, 'regenerate'])->name('payroll.runs.regenerate');
    Route::delete('/payroll/runs/{run}', [PayrollController::class, 'destroy'])->name('payroll.runs.destroy');
    Route::resource('/payroll/components', SalaryComponentController::class)->except(['index', 'show'])->parameters(['components' => 'component']);
    Route::resource('/payroll/structures', SalaryStructureController::class)->except(['index', 'show'])->parameters(['structures' => 'structure']);
    Route::post('/payroll/salaries', [EmployeeSalaryController::class, 'store'])->name('payroll.salaries.store');
});
Route::middleware(['auth', 'permission:payroll.approve'])->group(function () {
    Route::post('/payroll/runs/{run}/approve', [PayrollController::class, 'approve'])->name('payroll.runs.approve');
    Route::post('/payroll/runs/{run}/mark-paid', [PayrollController::class, 'markPaid'])->name('payroll.runs.markPaid');
});
