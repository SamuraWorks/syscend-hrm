<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends ApiController
{
    /**
     * List employees — paginated with search and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Employee::with(['department:id,name', 'position:id,name'])
            ->when($request->search, function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('employee_id', 'like', "%{$search}%");
                });
            })
            ->when($request->department_id, fn ($q, $v) => $q->where('department_id', $v))
            ->when($request->position_id, fn ($q, $v) => $q->where('position_id', $v))
            ->when($request->employment_status, fn ($q, $v) => $q->where('employment_status', $v));

        return $this->paginated($query->paginate(15));
    }

    /**
     * Create a new employee.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|string|unique:employees,employee_id',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'nullable|string|max:30',
            'dob' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'nationality' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'department_id' => 'nullable|exists:departments,id',
            'position_id' => 'nullable|exists:positions,id',
            'reporting_manager_id' => 'nullable|exists:employees,id',
            'date_of_joining' => 'nullable|date',
            'contract_type' => 'nullable|string|max:50',
            'employment_status' => 'nullable|string|max:50',
            'salary' => 'nullable|numeric|min:0',
        ]);

        $employee = Employee::create($validated);

        return $this->success(
            $employee->load(['department:id,name', 'position:id,name']),
            'Employee created successfully',
            201
        );
    }

    /**
     * Show a single employee with relationships.
     */
    public function show(Employee $employee): JsonResponse
    {
        return $this->success(
            $employee->load([
                'department:id,name',
                'position:id,name',
                'reportingManager:id,first_name,last_name,employee_id',
                'latestSalary',
            ])
        );
    }

    /**
     * Update an employee (partial update allowed).
     */
    public function update(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'sometimes|string|unique:employees,employee_id,'.$employee->id,
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:employees,email,'.$employee->id,
            'phone' => 'nullable|string|max:30',
            'dob' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'nationality' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'department_id' => 'nullable|exists:departments,id',
            'position_id' => 'nullable|exists:positions,id',
            'reporting_manager_id' => 'nullable|exists:employees,id',
            'date_of_joining' => 'nullable|date',
            'contract_type' => 'nullable|string|max:50',
            'employment_status' => 'nullable|string|max:50',
            'salary' => 'nullable|numeric|min:0',
        ]);

        $employee->update($validated);

        return $this->success(
            $employee->fresh(['department:id,name', 'position:id,name']),
            'Employee updated successfully'
        );
    }

    /**
     * Soft-delete an employee.
     */
    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();

        return $this->success(null, 'Employee deleted successfully');
    }
}
