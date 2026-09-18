<?php

namespace Modules\Employee\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployeeController extends Controller
{
    /**
     * Columns users may order by — guards against injection into orderBy().
     */
    private const SORTABLE = ['id', 'first_name', 'last_name', 'email', 'department_id', 'position_id', 'date_of_joining', 'salary', 'employment_status'];

    private function safeSort(?string $sort): ?string
    {
        if (! $sort) {
            return null;
        }

        return in_array($sort, self::SORTABLE, true) ? $sort : null;
    }

    public function index(Request $request): Response
    {
        $sort = $this->safeSort($request->sort);
        $direction = strtolower($request->direction ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $paginator = Employee::query()
            ->with(['department', 'position'])
            ->when($request->search, fn ($q, $s) => $q->where(fn ($q) => $q->where('first_name', 'like', "%{$s}%")
                ->orWhere('last_name', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%")
                ->orWhere('employee_id', 'like', "%{$s}%")
            )
            )
            ->when($request->department, fn ($q, $d) => $q->where('department_id', $d))
            ->when($request->position, fn ($q, $p) => $q->where('position_id', $p))
            ->when($request->status, fn ($q, $s) => $q->where('employment_status', $s))
            ->when($sort,
                fn ($q, $s) => $q->orderBy($s, $direction),
                fn ($q) => $q->orderBy('first_name')
            )
            ->paginate($request->per_page ?? 25)
            ->withQueryString();

        return Inertia::render('employees/Index', [
            'employees' => [
                'data' => $paginator->items(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem() ?? 0,
                    'to' => $paginator->lastItem() ?? 0,
                ],
                'links' => [
                    'prev' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl(),
                ],
            ],
            'departments' => Department::orderBy('name')->get(['id', 'name']),
            'positions' => Position::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'department', 'position', 'status', 'sort', 'direction', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('employees/Create', [
            'departments' => Department::orderBy('name')->get(['id', 'name']),
            'positions' => Position::orderBy('name')->get(['id', 'name', 'department_id']),
            'managers' => Employee::where('employment_status', 'Active')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'employee_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:employees,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'dob' => ['nullable', 'date', 'before:-18 years'],
            'gender' => ['nullable', 'in:Male,Female,Other'],
            'nationality' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'position_id' => ['nullable', 'exists:positions,id'],
            'reporting_manager_id' => ['nullable', 'exists:employees,id'],
            'date_of_joining' => ['nullable', 'date'],
            'contract_type' => ['required', 'in:Permanent,Contract,Temporary'],
            'employment_status' => ['required', 'in:Active,Inactive,On Leave,Terminated'],
            'salary' => ['nullable', 'numeric', 'min:0'],
        ]);

        $data['employee_id'] = $this->generateEmployeeId();

        Employee::create($data);

        return redirect()->route('employees.index')
            ->with('success', 'Employee created successfully.');
    }

    public function show(Employee $employee): Response
    {
        $employee->load(['department', 'position', 'reportingManager', 'documents', 'history.changedBy']);

        return Inertia::render('employees/Show', [
            'employee' => $employee,
        ]);
    }

    public function edit(Employee $employee): Response
    {
        return Inertia::render('employees/Edit', [
            'employee' => $employee,
            'departments' => Department::orderBy('name')->get(['id', 'name']),
            'positions' => Position::orderBy('name')->get(['id', 'name', 'department_id']),
            'managers' => Employee::where('employment_status', 'Active')
                ->where('id', '!=', $employee->id)
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'employee_id']),
        ]);
    }

    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', Rule::unique('employees', 'email')->ignore($employee->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'dob' => ['nullable', 'date', 'before:-18 years'],
            'gender' => ['nullable', 'in:Male,Female,Other'],
            'nationality' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'position_id' => ['nullable', 'exists:positions,id'],
            'reporting_manager_id' => ['nullable', 'exists:employees,id'],
            'date_of_joining' => ['nullable', 'date'],
            'contract_type' => ['required', 'in:Permanent,Contract,Temporary'],
            'employment_status' => ['required', 'in:Active,Inactive,On Leave,Terminated'],
            'salary' => ['nullable', 'numeric', 'min:0'],
        ]);

        $employee->update($data);

        return redirect()->route('employees.show', $employee)
            ->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        $employee->update(['employment_status' => 'Terminated']);
        $employee->delete();

        return redirect()->route('employees.index')
            ->with('success', 'Employee removed successfully.');
    }

    public function export(Request $request): StreamedResponse
    {
        $sort = $this->safeSort($request->sort);
        $direction = strtolower($request->direction ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $employees = Employee::query()
            ->with(['department', 'position'])
            ->when($request->filled('search'), fn ($q, $s) => $q->where(fn ($q) => $q->where('first_name', 'like', "%{$s}%")
                ->orWhere('last_name', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%")
                ->orWhere('employee_id', 'like', "%{$s}%")
            )
            )
            ->when($request->filled('department'), fn ($q, $d) => $q->where('department_id', $d))
            ->when($request->filled('position'), fn ($q, $p) => $q->where('position_id', $p))
            ->when($request->filled('status'), fn ($q, $s) => $q->where('employment_status', $s))
            ->when($sort,
                fn ($q, $s) => $q->orderBy($s, $direction),
                fn ($q) => $q->orderBy('first_name')
            )
            ->get();

        $filename = 'employees-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($employees) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM so Excel opens Léones/polyglot names correctly
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'Employee ID', 'First Name', 'Last Name', 'Email', 'Phone',
                'Department', 'Position', 'Employment Status', 'Contract Type',
                'Date of Joining', 'Salary',
            ]);

            foreach ($employees as $employee) {
                fputcsv($handle, [
                    $employee->employee_id,
                    $employee->first_name,
                    $employee->last_name,
                    $employee->email,
                    $employee->phone,
                    $employee->department?->name,
                    $employee->position?->name,
                    $employee->employment_status,
                    $employee->contract_type,
                    $employee->date_of_joining?->format('Y-m-d'),
                    $employee->salary,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    private function generateEmployeeId(): string
    {
        $last = Employee::withTrashed()->orderByDesc('id')->value('employee_id');
        if (! $last) {
            return 'EMP-001';
        }
        $num = (int) str_replace('EMP-', '', $last) + 1;

        return 'EMP-'.str_pad($num, 3, '0', STR_PAD_LEFT);
    }
}
