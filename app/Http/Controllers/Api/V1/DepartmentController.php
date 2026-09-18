<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends ApiController
{
    /**
     * List all departments with positions_count and employees_count.
     */
    public function index(): JsonResponse
    {
        $departments = Department::withCount(['positions', 'employees'])->get();

        return $this->success($departments);
    }

    /**
     * Create a department.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150|unique:departments,name',
            'description' => 'nullable|string',
            'head_id' => 'nullable|exists:employees,id',
            'parent_id' => 'nullable|exists:departments,id',
            'cost_center' => 'nullable|string|max:50',
        ]);

        $department = Department::create($validated);

        return $this->success($department, 'Department created successfully', 201);
    }

    /**
     * Show a single department with its positions list.
     */
    public function show(Department $department): JsonResponse
    {
        return $this->success($department->load('positions:id,name,level,salary_min,salary_max'));
    }

    /**
     * Update a department.
     */
    public function update(Request $request, Department $department): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:150|unique:departments,name,'.$department->id,
            'description' => 'nullable|string',
            'head_id' => 'nullable|exists:employees,id',
            'parent_id' => 'nullable|exists:departments,id',
            'cost_center' => 'nullable|string|max:50',
        ]);

        $department->update($validated);

        return $this->success($department->fresh(), 'Department updated successfully');
    }

    /**
     * Delete a department.
     */
    public function destroy(Department $department): JsonResponse
    {
        $department->delete();

        return $this->success(null, 'Department deleted successfully');
    }
}
