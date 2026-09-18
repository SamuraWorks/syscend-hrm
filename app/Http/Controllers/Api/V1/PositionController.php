<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Position;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends ApiController
{
    /**
     * List positions, optionally filtered by department_id.
     */
    public function index(Request $request): JsonResponse
    {
        $positions = Position::with('department:id,name')
            ->when($request->department_id, fn ($q, $v) => $q->where('department_id', $v))
            ->get();

        return $this->success($positions);
    }

    /**
     * Create a position.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string',
            'department_id' => 'required|exists:departments,id',
            'level' => 'nullable|string|max:50',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
        ]);

        $position = Position::create($validated);

        return $this->success($position->load('department:id,name'), 'Position created successfully', 201);
    }

    /**
     * Show a single position.
     */
    public function show(Position $position): JsonResponse
    {
        return $this->success($position->load('department:id,name'));
    }

    /**
     * Update a position.
     */
    public function update(Request $request, Position $position): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:150',
            'description' => 'nullable|string',
            'department_id' => 'sometimes|exists:departments,id',
            'level' => 'nullable|string|max:50',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
        ]);

        $position->update($validated);

        return $this->success($position->fresh(['department:id,name']), 'Position updated successfully');
    }

    /**
     * Delete a position.
     */
    public function destroy(Position $position): JsonResponse
    {
        $position->delete();

        return $this->success(null, 'Position deleted successfully');
    }
}
