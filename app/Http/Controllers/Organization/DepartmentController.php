<?php

namespace App\Http\Controllers\Organization;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(): Response
    {
        $departments = Department::with(['parent', 'head'])
            ->withCount('employees')
            ->orderBy('name')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'description' => $d->description,
                'cost_center' => $d->cost_center,
                'parent' => $d->parent ? ['id' => $d->parent->id, 'name' => $d->parent->name] : null,
                'head' => $d->head ? ['id' => $d->head->id, 'name' => $d->head->first_name.' '.$d->head->last_name] : null,
                'employees_count' => $d->employees_count,
            ]);

        return Inertia::render('departments/Index', [
            'departments' => $departments,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('departments/Create', [
            'parents' => Department::orderBy('name')->get(['id', 'name']),
            'managers' => Employee::where('employment_status', 'Active')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'employee_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:departments,name'],
            'description' => ['nullable', 'string', 'max:500'],
            'parent_id' => ['nullable', 'exists:departments,id'],
            'head_id' => ['nullable', 'exists:employees,id'],
            'cost_center' => ['nullable', 'string', 'max:50'],
        ]);

        $department = Department::create(array_filter($data, fn ($v) => $v !== null && $v !== ''));

        return redirect()->route('departments.show', $department)
            ->with('success', 'Department created successfully.');
    }

    public function show(Department $department): Response
    {
        $department->load(['parent', 'head', 'children', 'positions']);

        return Inertia::render('departments/Show', [
            'department' => [
                'id' => $department->id,
                'name' => $department->name,
                'description' => $department->description,
                'cost_center' => $department->cost_center,
                'parent' => $department->parent
                    ? ['id' => $department->parent->id, 'name' => $department->parent->name]
                    : null,
                'head' => $department->head
                    ? ['id' => $department->head->id, 'name' => $department->head->first_name.' '.$department->head->last_name]
                    : null,
                'children' => $department->children->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'employees_count' => $c->employees()->count(),
                ]),
                'positions' => $department->positions->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'employees_count' => $p->employees()->count(),
                ]),
                'employees_count' => $department->employees()->count(),
            ],
        ]);
    }

    public function edit(Department $department): Response
    {
        $excludeIds = $this->getDescendantIds($department->id);
        $excludeIds[] = $department->id;

        return Inertia::render('departments/Edit', [
            'department' => $department->only('id', 'name', 'description', 'parent_id', 'head_id', 'cost_center'),
            'parents' => Department::whereNotIn('id', $excludeIds)->orderBy('name')->get(['id', 'name']),
            'managers' => Employee::where('employment_status', 'Active')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'employee_id']),
        ]);
    }

    public function update(Request $request, Department $department): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:departments,name,'.$department->id],
            'description' => ['nullable', 'string', 'max:500'],
            'parent_id' => ['nullable', 'exists:departments,id'],
            'head_id' => ['nullable', 'exists:employees,id'],
            'cost_center' => ['nullable', 'string', 'max:50'],
        ]);

        $department->update($data);

        return redirect()->route('departments.show', $department)
            ->with('success', 'Department updated successfully.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        Department::where('parent_id', $department->id)
            ->update(['parent_id' => $department->parent_id]);

        $department->delete();

        return redirect()->route('departments.index')
            ->with('success', 'Department deleted.');
    }

    private function getDescendantIds(int $id): array
    {
        $ids = [];
        $children = Department::where('parent_id', $id)->pluck('id');
        foreach ($children as $childId) {
            $ids[] = $childId;
            array_push($ids, ...$this->getDescendantIds($childId));
        }

        return $ids;
    }
}
