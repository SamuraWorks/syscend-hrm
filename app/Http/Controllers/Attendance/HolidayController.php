<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HolidayController extends Controller
{
    public function index()
    {
        $holidays = Holiday::orderBy('date')->get()->map(fn ($h) => [
            'id' => $h->id,
            'name' => $h->name,
            'date' => $h->date->format('Y-m-d'),
            'is_recurring' => $h->is_recurring,
            'type' => $h->type,
            'description' => $h->description,
        ]);

        return Inertia::render('attendance/holidays/Index', compact('holidays'));
    }

    public function create()
    {
        return Inertia::render('attendance/holidays/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'date' => 'required|date',
            'is_recurring' => 'boolean',
            'type' => 'in:public,optional,restricted',
            'description' => 'nullable|string|max:500',
        ]);

        Holiday::create($data);

        return redirect('/holidays')->with('success', 'Holiday created.');
    }

    public function edit(Holiday $holiday)
    {
        return Inertia::render('attendance/holidays/Edit', [
            'holiday' => [
                'id' => $holiday->id,
                'name' => $holiday->name,
                'date' => $holiday->date->format('Y-m-d'),
                'is_recurring' => $holiday->is_recurring,
                'type' => $holiday->type,
                'description' => $holiday->description,
            ],
        ]);
    }

    public function update(Request $request, Holiday $holiday)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'date' => 'required|date',
            'is_recurring' => 'boolean',
            'type' => 'in:public,optional,restricted',
            'description' => 'nullable|string|max:500',
        ]);

        $holiday->update($data);

        return redirect('/holidays')->with('success', 'Holiday updated.');
    }

    public function destroy(Holiday $holiday)
    {
        $holiday->delete();

        return redirect('/holidays')->with('success', 'Holiday deleted.');
    }
}
