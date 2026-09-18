<?php

namespace App\Http\Controllers\Leave;

use App\Http\Controllers\Controller;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveTypeController extends Controller
{
    public function index()
    {
        $types = LeaveType::orderBy('name')->get()->map(fn ($t) => [
            'id' => $t->id,
            'name' => $t->name,
            'code' => $t->code,
            'days_allowed' => $t->days_allowed,
            'is_paid' => $t->is_paid,
            'is_carry_forward' => $t->is_carry_forward,
            'max_carry_forward' => $t->max_carry_forward,
            'allow_half_day' => $t->allow_half_day,
            'color' => $t->color,
            'is_active' => $t->is_active,
            'description' => $t->description,
        ]);

        return Inertia::render('leave/types/Index', compact('types'));
    }

    public function create()
    {
        return Inertia::render('leave/types/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:leave_types,code',
            'days_allowed' => 'required|integer|min:1|max:365',
            'is_paid' => 'boolean',
            'is_carry_forward' => 'boolean',
            'max_carry_forward' => 'nullable|integer|min:0',
            'allow_half_day' => 'boolean',
            'color' => 'nullable|string|max:7',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:500',
        ]);

        LeaveType::create($data);

        return redirect('/leave/types')->with('success', 'Leave type created.');
    }

    public function edit(LeaveType $type)
    {
        return Inertia::render('leave/types/Edit', ['type' => $type]);
    }

    public function update(Request $request, LeaveType $type)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:leave_types,code,'.$type->id,
            'days_allowed' => 'required|integer|min:1|max:365',
            'is_paid' => 'boolean',
            'is_carry_forward' => 'boolean',
            'max_carry_forward' => 'nullable|integer|min:0',
            'allow_half_day' => 'boolean',
            'color' => 'nullable|string|max:7',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:500',
        ]);

        $type->update($data);

        return redirect('/leave/types')->with('success', 'Leave type updated.');
    }

    public function destroy(LeaveType $type)
    {
        $type->delete();

        return redirect('/leave/types')->with('success', 'Leave type deleted.');
    }
}
