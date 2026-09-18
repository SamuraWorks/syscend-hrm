<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\SalaryComponent;
use App\Models\SalaryStructure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalaryStructureController extends Controller
{
    public function index()
    {
        $structures = SalaryStructure::withCount('components')->orderBy('name')->get();

        return Inertia::render('payroll/structures/Index', compact('structures'));
    }

    public function create()
    {
        $components = SalaryComponent::where('is_active', true)->orderBy('type')->orderBy('name')->get();

        return Inertia::render('payroll/structures/Create', compact('components'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:50|unique:salary_structures,code',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'components' => 'array',
            'components.*.id' => 'required|exists:salary_components,id',
            'components.*.override_value' => 'nullable|numeric|min:0',
        ]);

        $structure = SalaryStructure::create($data);

        $sync = [];
        foreach ($data['components'] ?? [] as $comp) {
            $sync[$comp['id']] = ['override_value' => $comp['override_value'] ?? null];
        }
        $structure->components()->sync($sync);

        return redirect('/payroll/structures')->with('success', 'Structure created.');
    }

    public function edit(SalaryStructure $structure)
    {
        $structure->load('components');
        $components = SalaryComponent::where('is_active', true)->orderBy('type')->orderBy('name')->get();

        return Inertia::render('payroll/structures/Edit', compact('structure', 'components'));
    }

    public function update(Request $request, SalaryStructure $structure)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:50|unique:salary_structures,code,'.$structure->id,
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'components' => 'array',
            'components.*.id' => 'required|exists:salary_components,id',
            'components.*.override_value' => 'nullable|numeric|min:0',
        ]);

        $structure->update($data);

        $sync = [];
        foreach ($data['components'] ?? [] as $comp) {
            $sync[$comp['id']] = ['override_value' => $comp['override_value'] ?? null];
        }
        $structure->components()->sync($sync);

        return redirect('/payroll/structures')->with('success', 'Structure updated.');
    }

    public function destroy(SalaryStructure $structure)
    {
        $structure->delete();

        return redirect('/payroll/structures')->with('success', 'Structure deleted.');
    }
}
