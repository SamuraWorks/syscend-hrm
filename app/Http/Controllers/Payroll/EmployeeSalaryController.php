<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeSalary;
use App\Models\SalaryStructure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeSalaryController extends Controller
{
    public function index()
    {
        $employees = Employee::with(['latestSalary.structure'])
            ->where('employment_status', 'Active')
            ->orderBy('first_name')
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'name' => $e->first_name.' '.$e->last_name,
                'employee_id' => $e->employee_id,
                'department' => $e->department?->name,
                'position' => $e->position?->name,
                'basic_salary' => $e->latestSalary?->basic_salary,
                'structure' => $e->latestSalary?->structure?->name,
                'effective_date' => $e->latestSalary?->effective_date?->format('Y-m-d'),
            ]);

        $structures = SalaryStructure::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('payroll/salaries/Index', compact('employees', 'structures'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'salary_structure_id' => 'nullable|exists:salary_structures,id',
            'basic_salary' => 'required|numeric|min:0',
            'effective_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        EmployeeSalary::create($data);

        return back()->with('success', 'Salary updated.');
    }
}
