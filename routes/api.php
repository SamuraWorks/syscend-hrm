<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\EmailTemplateController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SystemSettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\LeaveController;
use App\Http\Controllers\Api\V1\PayrollController;
use App\Http\Controllers\Api\V1\PerformanceController;
use App\Http\Controllers\Api\V1\PositionController;
use App\Http\Controllers\Api\V1\ReportsController;
use App\Http\Controllers\Api\V1\TrainingController;
use App\Http\Controllers\Attendance\HolidayController;
use App\Http\Controllers\Attendance\ShiftController;
use App\Http\Controllers\Auth\MfaController;
use App\Http\Controllers\Auth\SessionController;
use App\Http\Controllers\Documents\ComplianceChecklistController;
use App\Http\Controllers\Employee\DocumentController;
use App\Http\Controllers\Leave\LeavePolicyController;
use App\Http\Controllers\Leave\LeaveTypeController;
use App\Http\Controllers\Organization\OrgChartController;
use App\Http\Controllers\Payroll\DeductionController;
use App\Http\Controllers\Payroll\PayslipController;
use App\Http\Controllers\Payroll\SalaryAssignmentController;
use App\Http\Controllers\Payroll\SalaryComponentController;
use App\Http\Controllers\Payroll\SalaryStructureController;
use App\Http\Controllers\Performance\AppraisalController;
use App\Http\Controllers\Performance\FeedbackController;
use App\Http\Controllers\Performance\GoalController;
use App\Http\Controllers\Performance\PerformanceReportController;
use App\Http\Controllers\Recruitment\ApplicantController;
use App\Http\Controllers\Recruitment\ApplicationController;
use App\Http\Controllers\Recruitment\InterviewController;
use App\Http\Controllers\Recruitment\JobController;
use App\Http\Controllers\Recruitment\OfferController;
use App\Http\Controllers\Recruitment\RecruitmentReportController;
use App\Http\Controllers\Reports\DashboardController;
use App\Http\Controllers\Reports\ReportController;
use App\Http\Controllers\Training\EmployeeSkillController;
use App\Http\Controllers\Training\SkillController;
use App\Http\Controllers\Training\TrainingMaterialController;
use App\Http\Middleware\ApiRoleGate;
use Illuminate\Support\Facades\Route;

// ══════════════════════════════════════════════════════════
//  REST API v1 — Sanctum token auth
// ══════════════════════════════════════════════════════════
Route::prefix('v1')->group(function () {

    // Public — rate-limited (brute-force defence)
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:login');

    // Protected — throttle + require active user with at least one role
    Route::middleware(['auth:sanctum', 'throttle:api', ApiRoleGate::class])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        // Employees
        Route::apiResource('employees', EmployeeController::class);

        // Org structure
        Route::apiResource('departments', DepartmentController::class);
        Route::apiResource('positions', PositionController::class);

        // Attendance
        Route::get('attendance', [AttendanceController::class, 'index']);
        Route::post('attendance/check-in', [AttendanceController::class, 'checkIn']);
        Route::post('attendance/check-out', [AttendanceController::class, 'checkOut']);
        Route::get('attendance/employee/{employee}', [AttendanceController::class, 'byEmployee']);

        // Leave
        Route::get('leave/types', [LeaveController::class, 'types']);
        Route::apiResource('leave/requests', LeaveController::class)
            ->parameters(['requests' => 'leaveRequest']);
        Route::patch('leave/requests/{leaveRequest}/approve', [LeaveController::class, 'approve']);
        Route::patch('leave/requests/{leaveRequest}/reject', [LeaveController::class, 'reject']);

        // Payroll
        Route::get('payroll/runs', [PayrollController::class, 'runs']);
        Route::get('payroll/runs/{run}', [PayrollController::class, 'showRun']);
        Route::get('payroll/payslips', [PayrollController::class, 'payslips']);
        Route::get('payroll/payslips/{payslip}', [PayrollController::class, 'showPayslip']);

        // Performance
        Route::get('performance/cycles', [PerformanceController::class, 'cycles']);
        Route::get('performance/cycles/{cycle}', [PerformanceController::class, 'showCycle']);
        Route::get('performance/ratings', [PerformanceController::class, 'ratings']);
        Route::get('performance/ratings/{rating}', [PerformanceController::class, 'showRating']);

        // Training
        Route::get('training/courses', [TrainingController::class, 'courses']);
        Route::get('training/courses/{course}', [TrainingController::class, 'showCourse']);
        Route::get('training/sessions', [TrainingController::class, 'sessions']);
        Route::get('training/enrollments', [TrainingController::class, 'enrollments']);
        Route::post('training/enrollments', [TrainingController::class, 'enroll']);
        Route::patch('training/enrollments/{enrollment}/complete', [TrainingController::class, 'complete']);

        // Reports
        Route::get('reports/headcount', [ReportsController::class, 'headcount']);
        Route::get('reports/attendance', [ReportsController::class, 'attendance']);
        Route::get('reports/leave', [ReportsController::class, 'leave']);
        Route::get('reports/payroll', [ReportsController::class, 'payroll']);
    });
});

// ══════════════════════════════════════════════════════════
//  Legacy / existing module routes below
// ══════════════════════════════════════════════════════════

/*
|--------------------------------------------------------------------------
| API Routes — Syscend-HRM
|--------------------------------------------------------------------------
| All routes are prefixed with /api automatically via bootstrap/app.php
| Grouped by module for clarity.
*/

// ──────────────────────────────────────────
// Module 01: Authentication
// ──────────────────────────────────────────
Route::prefix('auth')->group(function () {
    // Public auth routes (no token required) — rate-limited
    Route::post('login', [App\Http\Controllers\Auth\AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('forgot-password', [App\Http\Controllers\Auth\AuthController::class, 'forgotPassword'])->middleware('throttle:login');
    Route::post('reset-password', [App\Http\Controllers\Auth\AuthController::class, 'resetPassword'])->middleware('throttle:login');

    // Protected auth routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [App\Http\Controllers\Auth\AuthController::class, 'logout']);
        Route::post('refresh-token', [App\Http\Controllers\Auth\AuthController::class, 'refreshToken']);
        Route::post('change-password', [App\Http\Controllers\Auth\AuthController::class, 'changePassword']);
        Route::get('user', [App\Http\Controllers\Auth\AuthController::class, 'user']);

        // MFA
        Route::prefix('mfa')->group(function () {
            Route::post('enable', [MfaController::class, 'enable']);
            Route::post('verify', [MfaController::class, 'verify']);
            Route::post('disable', [MfaController::class, 'disable']);
            Route::get('backup-codes', [MfaController::class, 'backupCodes']);
        });

        // Sessions (admin only)
        Route::prefix('sessions')->middleware('role:Admin')->group(function () {
            Route::get('/', [SessionController::class, 'index']);
            Route::delete('{id}', [SessionController::class, 'destroy']);
        });
    });
});

// ──────────────────────────────────────────
// All routes below require Sanctum auth + API role gate
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:api', ApiRoleGate::class])->group(function () {

    // ──────────────────────────────────────
    // Module 02: Employee Management
    // ──────────────────────────────────────
    Route::prefix('employees')->group(function () {
        Route::get('/', [App\Http\Controllers\Employee\EmployeeController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Employee\EmployeeController::class, 'store']);
        Route::get('export', [App\Http\Controllers\Employee\EmployeeController::class, 'export']);
        Route::post('bulk-import', [App\Http\Controllers\Employee\EmployeeController::class, 'bulkImport']);
        Route::get('{id}', [App\Http\Controllers\Employee\EmployeeController::class, 'show']);
        Route::put('{id}', [App\Http\Controllers\Employee\EmployeeController::class, 'update']);
        Route::delete('{id}', [App\Http\Controllers\Employee\EmployeeController::class, 'destroy']);
        Route::post('{id}/documents', [DocumentController::class, 'store']);
        Route::get('{id}/documents', [DocumentController::class, 'index']);
        Route::delete('{id}/documents/{docId}', [DocumentController::class, 'destroy']);
        Route::get('{id}/history', [App\Http\Controllers\Employee\EmployeeController::class, 'history']);
    });

    // ──────────────────────────────────────
    // Module 03: Organizational Structure
    // ──────────────────────────────────────
    Route::apiResource('departments', App\Http\Controllers\Organization\DepartmentController::class);
    Route::get('departments/{id}/employees', [App\Http\Controllers\Organization\DepartmentController::class, 'employees']);
    Route::apiResource('positions', App\Http\Controllers\Organization\PositionController::class);
    Route::prefix('org-chart')->group(function () {
        Route::get('/', [OrgChartController::class, 'index']);
        Route::get('manager/{id}', [OrgChartController::class, 'teamDirect']);
        Route::get('manager/{id}/tree', [OrgChartController::class, 'teamTree']);
    });

    // ──────────────────────────────────────
    // Module 04: Attendance & Shifts
    // ──────────────────────────────────────
    Route::prefix('attendance')->group(function () {
        Route::post('check-in', [App\Http\Controllers\Attendance\AttendanceController::class, 'checkIn']);
        Route::post('check-out', [App\Http\Controllers\Attendance\AttendanceController::class, 'checkOut']);
        Route::get('today', [App\Http\Controllers\Attendance\AttendanceController::class, 'today']);
        Route::get('daily', [App\Http\Controllers\Attendance\AttendanceController::class, 'daily']);
        Route::get('monthly/{employee_id}', [App\Http\Controllers\Attendance\AttendanceController::class, 'monthly']);
        Route::get('report', [App\Http\Controllers\Attendance\AttendanceController::class, 'report']);
        Route::post('mark', [App\Http\Controllers\Attendance\AttendanceController::class, 'mark']);
        Route::put('{id}', [App\Http\Controllers\Attendance\AttendanceController::class, 'update']);
    });
    Route::apiResource('shifts', ShiftController::class);
    Route::post('shifts/{id}/assign', [ShiftController::class, 'assign']);
    Route::apiResource('holidays', HolidayController::class);

    // ──────────────────────────────────────
    // Module 05: Leave Management
    // ──────────────────────────────────────
    Route::apiResource('leave-types', LeaveTypeController::class);
    Route::apiResource('leave-policies', LeavePolicyController::class);
    Route::prefix('leaves')->group(function () {
        Route::get('/', [App\Http\Controllers\Leave\LeaveController::class, 'index']);
        Route::post('apply', [App\Http\Controllers\Leave\LeaveController::class, 'apply']);
        Route::get('pending', [App\Http\Controllers\Leave\LeaveController::class, 'pending']);
        Route::get('calendar', [App\Http\Controllers\Leave\LeaveController::class, 'calendar']);
        Route::get('report', [App\Http\Controllers\Leave\LeaveController::class, 'report']);
        Route::get('{id}', [App\Http\Controllers\Leave\LeaveController::class, 'show']);
        Route::put('{id}/approve', [App\Http\Controllers\Leave\LeaveController::class, 'approve']);
        Route::put('{id}/reject', [App\Http\Controllers\Leave\LeaveController::class, 'reject']);
        Route::put('{id}/cancel', [App\Http\Controllers\Leave\LeaveController::class, 'cancel']);
    });
    Route::get('leave-balance/{employee_id}', [App\Http\Controllers\Leave\LeaveController::class, 'balance']);

    // ──────────────────────────────────────
    // Module 06: Recruitment & ATS
    // ──────────────────────────────────────
    Route::apiResource('jobs', JobController::class);
    Route::prefix('applicants')->group(function () {
        Route::get('/', [ApplicantController::class, 'index']);
        Route::get('{id}', [ApplicantController::class, 'show']);
    });
    Route::prefix('applications')->group(function () {
        Route::put('{id}/status', [ApplicationController::class, 'updateStatus']);
        Route::post('{id}/notes', [ApplicationController::class, 'addNote']);
        Route::get('{id}/notes', [ApplicationController::class, 'notes']);
    });
    Route::apiResource('interviews', InterviewController::class);
    Route::apiResource('offers', OfferController::class);
    Route::get('recruitment/report', [RecruitmentReportController::class, 'index']);

    // ──────────────────────────────────────
    // Module 07: Payroll & Compensation
    // ──────────────────────────────────────
    Route::apiResource('salary-components', SalaryComponentController::class);
    Route::apiResource('salary-structures', SalaryStructureController::class);
    Route::prefix('salary-assignments')->group(function () {
        Route::post('/', [SalaryAssignmentController::class, 'store']);
        Route::get('{employee_id}', [SalaryAssignmentController::class, 'show']);
    });
    Route::prefix('payroll')->group(function () {
        Route::get('runs', [App\Http\Controllers\Payroll\PayrollController::class, 'index']);
        Route::post('run', [App\Http\Controllers\Payroll\PayrollController::class, 'process']);
        Route::get('runs/{id}', [App\Http\Controllers\Payroll\PayrollController::class, 'show']);
        Route::put('runs/{id}/approve', [App\Http\Controllers\Payroll\PayrollController::class, 'approve']);
        Route::get('report', [App\Http\Controllers\Payroll\PayrollController::class, 'report']);
    });
    Route::prefix('payslips')->group(function () {
        Route::get('{id}', [PayslipController::class, 'show']);
        Route::post('distribute', [PayslipController::class, 'distribute']);
    });
    Route::apiResource('deductions', DeductionController::class);

    // ──────────────────────────────────────
    // Module 08: Performance Management
    // ──────────────────────────────────────
    Route::apiResource('goals', GoalController::class);
    Route::post('goals/{id}/review', [GoalController::class, 'review']);
    Route::apiResource('appraisals', AppraisalController::class);
    Route::put('appraisals/{id}/submit', [AppraisalController::class, 'submit']);
    Route::put('appraisals/{id}/finalize', [AppraisalController::class, 'finalize']);
    Route::prefix('feedback')->group(function () {
        Route::post('request', [FeedbackController::class, 'request']);
        Route::get('/', [FeedbackController::class, 'index']);
        Route::put('{id}', [FeedbackController::class, 'submit']);
    });
    Route::get('performance/report', [PerformanceReportController::class, 'index']);

    // ──────────────────────────────────────
    // Module 09: Training & Development
    // ──────────────────────────────────────
    Route::apiResource('trainings', App\Http\Controllers\Training\TrainingController::class);
    Route::post('trainings/{id}/enroll', [App\Http\Controllers\Training\TrainingController::class, 'enroll']);
    Route::put('trainings/{id}/attendance', [App\Http\Controllers\Training\TrainingController::class, 'markAttendance']);
    Route::post('trainings/{id}/certificates', [App\Http\Controllers\Training\TrainingController::class, 'generateCertificates']);
    Route::get('trainings/{id}/materials', [App\Http\Controllers\Training\TrainingController::class, 'materials']);
    Route::post('training-materials', [TrainingMaterialController::class, 'store']);
    Route::apiResource('skills', SkillController::class);
    Route::prefix('employee-skills')->group(function () {
        Route::get('{employee_id}', [EmployeeSkillController::class, 'index']);
        Route::post('/', [EmployeeSkillController::class, 'store']);
        Route::put('{id}', [EmployeeSkillController::class, 'update']);
    });

    // ──────────────────────────────────────
    // Module 10: Documents & Compliance
    // ──────────────────────────────────────
    Route::apiResource('documents', App\Http\Controllers\Documents\DocumentController::class);
    Route::get('documents/{id}/versions', [App\Http\Controllers\Documents\DocumentController::class, 'versions']);
    Route::post('documents/{id}/acknowledge', [App\Http\Controllers\Documents\DocumentController::class, 'acknowledge']);
    Route::get('documents/{id}/acknowledgments', [App\Http\Controllers\Documents\DocumentController::class, 'acknowledgments']);
    Route::get('documents-expiring', [App\Http\Controllers\Documents\DocumentController::class, 'expiring']);
    Route::apiResource('compliance-checklists', ComplianceChecklistController::class);
    Route::post('compliance-checklists/{id}/complete-item', [ComplianceChecklistController::class, 'completeItem']);
    Route::get('compliance/dashboard', [ComplianceChecklistController::class, 'dashboard']);

    // ──────────────────────────────────────
    // Module 11: Reports & Analytics
    // ──────────────────────────────────────
    Route::prefix('dashboard')->group(function () {
        Route::get('executive', [DashboardController::class, 'executive']);
        Route::get('hr', [DashboardController::class, 'hr']);
        Route::get('manager', [DashboardController::class, 'manager']);
    });
    Route::prefix('reports')->group(function () {
        Route::get('employees', [ReportController::class, 'employees']);
        Route::get('attendance', [ReportController::class, 'attendance']);
        Route::get('leaves', [ReportController::class, 'leaves']);
        Route::get('recruitment', [ReportController::class, 'recruitment']);
        Route::get('payroll', [ReportController::class, 'payroll']);
        Route::get('performance', [ReportController::class, 'performance']);
        Route::get('turnover', [ReportController::class, 'turnover']);
        Route::post('custom', [ReportController::class, 'custom']);
        Route::post('save', [ReportController::class, 'save']);
        Route::get('saved', [ReportController::class, 'saved']);
        Route::delete('saved/{id}', [ReportController::class, 'deleteSaved']);
        Route::post('schedule', [ReportController::class, 'schedule']);
        Route::get('export', [ReportController::class, 'export']);
    });

    // ──────────────────────────────────────
    // Module 12: System Administration
    // ──────────────────────────────────────
    Route::middleware('role:Admin')->prefix('admin')->group(function () {
        // Users
        Route::apiResource('users', UserController::class);
        Route::post('users/{id}/reset-password', [UserController::class, 'resetPassword']);
        Route::post('users/bulk-import', [UserController::class, 'bulkImport']);
        Route::post('users/{id}/roles', [UserController::class, 'assignRole']);
        Route::delete('users/{id}/roles/{roleId}', [UserController::class, 'removeRole']);

        // Roles & Permissions
        Route::apiResource('roles', RoleController::class);
        Route::get('permissions', [RoleController::class, 'permissions']);

        // System Settings
        Route::get('system-settings', [SystemSettingController::class, 'index']);
        Route::put('system-settings', [SystemSettingController::class, 'update']);

        // Email Templates
        Route::get('email-templates', [EmailTemplateController::class, 'index']);
        Route::put('email-templates/{id}', [EmailTemplateController::class, 'update']);
        Route::post('email-templates/{id}/test', [EmailTemplateController::class, 'test']);

        // Audit Logs
        Route::get('audit-logs', [AuditLogController::class, 'index']);
        Route::get('audit-logs/export', [AuditLogController::class, 'export']);
    });
});

// ──────────────────────────────────────────
// Public Routes (no auth required)
// ──────────────────────────────────────────
Route::prefix('careers')->group(function () {
    Route::get('/', [JobController::class, 'publicIndex']);
    Route::get('{id}', [JobController::class, 'publicShow']);
    Route::post('{id}/apply', [ApplicationController::class, 'store'])
        ->middleware('throttle:careers');
});
