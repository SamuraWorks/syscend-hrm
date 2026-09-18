<?php

namespace Modules\Payroll\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SalaryComponent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalaryComponentController extends Controller
{
    public function index()
    {
        $components = SalaryComponent::orderBy('type')->orderBy('name')->get();

        return Inertia::render('payroll/components/Index', compact('components'));
    }

    public function create()
    {
        return Inertia::render('payroll/components/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:50|unique:salary_components,code',
            'type' => 'required|in:earning,deduction,tax',
            'calculation_type' => 'required|in:fixed,percentage_of_basic,percentage_of_gross',
            'value' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'is_taxable' => 'boolean',
            'is_active' => 'boolean',
        ]);
        SalaryComponent::create($data);

        return redirect('/payroll/components')->with('success', 'Component created.');
    }

    public function edit(SalaryComponent $component)
    {
        return Inertia::render('payroll/components/Edit', compact('component'));
    }

    public function update(Request $request, SalaryComponent $component)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:50|unique:salary_components,code,'.$component->id,
            'type' => 'required|in:earning,deduction,tax',
            'calculation_type' => 'required|in:fixed,percentage_of_basic,percentage_of_gross',
            'value' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'is_taxable' => 'boolean',
            'is_active' => 'boolean',
        ]);
        $component->update($data);

        return redirect('/payroll/components')->with('success', 'Component updated.');
    }

    public function destroy(SalaryComponent $component)
    {
        $component->delete();

        return redirect('/payroll/components')->with('success', 'Component deleted.');
    }
}
