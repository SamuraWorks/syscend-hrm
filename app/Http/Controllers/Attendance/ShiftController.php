<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShiftController extends Controller
{
    public function index()
    {
        $shifts = Shift::orderBy('name')->get()->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'start_time' => $s->start_time,
            'end_time' => $s->end_time,
            'break_minutes' => $s->break_minutes,
            'color' => $s->color,
            'is_active' => $s->is_active,
        ]);

        return Inertia::render('attendance/shifts/Index', compact('shifts'));
    }

    public function create()
    {
        return Inertia::render('attendance/shifts/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:shifts,name',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'break_minutes' => 'nullable|integer|min:0|max:120',
            'color' => 'nullable|string|max:7',
            'is_active' => 'boolean',
        ]);

        Shift::create($data);

        return redirect('/shifts')->with('success', 'Shift created.');
    }

    public function edit(Shift $shift)
    {
        return Inertia::render('attendance/shifts/Edit', ['shift' => $shift]);
    }

    public function update(Request $request, Shift $shift)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:shifts,name,'.$shift->id,
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'break_minutes' => 'nullable|integer|min:0|max:120',
            'color' => 'nullable|string|max:7',
            'is_active' => 'boolean',
        ]);

        $shift->update($data);

        return redirect('/shifts')->with('success', 'Shift updated.');
    }

    public function destroy(Shift $shift)
    {
        $shift->delete();

        return redirect('/shifts')->with('success', 'Shift deleted.');
    }
}
