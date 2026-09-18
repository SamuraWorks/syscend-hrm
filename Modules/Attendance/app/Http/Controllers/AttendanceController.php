<?php

namespace Modules\Attendance\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $canManage = $user->hasAnyPermission(['attendance.mark', 'employees.create']);
        $myEmployee = Employee::where('user_id', $user->id)->first();

        $month = $request->get('month', now()->format('Y-m'));
        [$year, $mon] = explode('-', $month);

        $query = Attendance::with(['employee:id,first_name,last_name,employee_id', 'shift:id,name,color'])
            ->whereYear('date', $year)
            ->whereMonth('date', $mon);

        if (! $canManage && $myEmployee) {
            // Employee: always scope to own records only
            $query->where('employee_id', $myEmployee->id);
        } elseif ($canManage && $request->get('employee_id')) {
            $query->where('employee_id', $request->get('employee_id'));
        }

        $records = $query->orderBy('date')->get()->map(fn ($a) => [
            'id' => $a->id,
            'date' => $a->date->format('Y-m-d'),
            'employee' => $a->employee ? [
                'id' => $a->employee->id,
                'name' => $a->employee->first_name.' '.$a->employee->last_name,
                'employee_id' => $a->employee->employee_id,
            ] : null,
            'shift' => $a->shift ? ['id' => $a->shift->id, 'name' => $a->shift->name, 'color' => $a->shift->color] : null,
            'check_in' => $a->check_in,
            'check_out' => $a->check_out,
            'worked_minutes' => $a->worked_minutes,
            'status' => $a->status,
            'notes' => $a->notes,
        ]);

        $employees = $canManage
            ? Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'employee_id'])
                ->map(fn ($e) => ['id' => $e->id, 'name' => $e->first_name.' '.$e->last_name, 'employee_id' => $e->employee_id])
            : collect();

        $shifts = Shift::where('is_active', true)->orderBy('name')->get(['id', 'name', 'color']);

        return Inertia::render('attendance/Index', [
            'records' => $records,
            'employees' => $employees,
            'shifts' => $shifts,
            'month' => $month,
            'selected_employee' => $canManage ? ($request->get('employee_id') ? (int) $request->get('employee_id') : null) : null,
            'canManage' => $canManage,
            'myEmployee' => $myEmployee ? ['id' => $myEmployee->id, 'name' => $myEmployee->first_name.' '.$myEmployee->last_name, 'employee_id' => $myEmployee->employee_id] : null,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $canManage = $user->hasAnyPermission(['attendance.mark', 'employees.create']);

        // Self-service: force own employee record
        if (! $canManage) {
            $myEmployee = Employee::where('user_id', $user->id)->first();
            if (! $myEmployee) {
                return back()->withErrors(['employee_id' => 'No employee record linked to your account.']);
            }
            $request->merge(['employee_id' => $myEmployee->id]);
        }

        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'date' => 'required|date',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
            'worked_minutes' => 'nullable|integer|min:0',
            'status' => 'required|in:present,absent,late,half_day,on_leave',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($data['check_in'] && $data['check_out']) {
            $in = strtotime($data['check_in']);
            $out = strtotime($data['check_out']);
            if ($out > $in) {
                $data['worked_minutes'] = (int) (($out - $in) / 60);
            }
        }

        Attendance::updateOrCreate(
            ['employee_id' => $data['employee_id'], 'date' => $data['date']],
            $data
        );

        return back()->with('success', 'Attendance recorded.');
    }

    public function update(Request $request, Attendance $attendance)
    {
        $data = $request->validate([
            'shift_id' => 'nullable|exists:shifts,id',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
            'worked_minutes' => 'nullable|integer|min:0',
            'status' => 'required|in:present,absent,late,half_day,on_leave',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($data['check_in'] && $data['check_out']) {
            $in = strtotime($data['check_in']);
            $out = strtotime($data['check_out']);
            if ($out > $in) {
                $data['worked_minutes'] = (int) (($out - $in) / 60);
            }
        }

        $attendance->update($data);

        return back()->with('success', 'Attendance updated.');
    }

    public function destroy(Attendance $attendance)
    {
        $attendance->delete();

        return back()->with('success', 'Record deleted.');
    }
}
