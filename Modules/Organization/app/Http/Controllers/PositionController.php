<?php

namespace Modules\Organization\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PositionController extends Controller
{
    public function index(): Response
    {
        $positions = Position::with('department')
            ->withCount('employees')
            ->orderBy('name')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'level' => $p->level,
                'salary_min' => $p->salary_min,
                'salary_max' => $p->salary_max,
                'department' => $p->department ? ['id' => $p->department->id, 'name' => $p->department->name] : null,
                'employees_count' => $p->employees_count,
            ]);

        return Inertia::render('positions/Index', [
            'positions' => $positions,
            'departments' => Department::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('positions/Create', [
            'departments' => Department::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'department_id' => ['required', 'exists:departments,id'],
            'level' => ['nullable', 'string', 'max:50'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0'],
        ]);

        $position = Position::create($data);

        return redirect()->route('positions.index')
            ->with('success', 'Position created successfully.');
    }

    public function edit(Position $position): Response
    {
        return Inertia::render('positions/Edit', [
            'position' => $position->only('id', 'name', 'description', 'department_id', 'level', 'salary_min', 'salary_max'),
            'departments' => Department::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Position $position): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'department_id' => ['required', 'exists:departments,id'],
            'level' => ['nullable', 'string', 'max:50'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0'],
        ]);

        $position->update($data);

        return redirect()->route('positions.index')
            ->with('success', 'Position updated successfully.');
    }

    public function destroy(Position $position): RedirectResponse
    {
        $position->delete();

        return redirect()->route('positions.index')
            ->with('success', 'Position deleted.');
    }
}
