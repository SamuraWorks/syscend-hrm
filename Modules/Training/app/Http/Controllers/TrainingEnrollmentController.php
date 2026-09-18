<?php

namespace Modules\Training\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Training\app\Models\TrainingEnrollment;
use Modules\Training\app\Models\TrainingSession;

class TrainingEnrollmentController extends Controller
{
    public function store(Request $request, TrainingSession $session)
    {
        $data = $request->validate([
            'employee_ids' => 'required|array|min:1',
            'employee_ids.*' => 'integer|exists:employees,id',
        ]);

        $added = 0;
        foreach ($data['employee_ids'] as $empId) {
            if (! TrainingEnrollment::where('session_id', $session->id)->where('employee_id', $empId)->exists()) {
                TrainingEnrollment::create([
                    'session_id' => $session->id,
                    'employee_id' => $empId,
                    'status' => 'enrolled',
                ]);
                $added++;
            }
        }

        return back()->with('success', "{$added} employee(s) enrolled.");
    }

    public function update(Request $request, TrainingEnrollment $enrollment)
    {
        $data = $request->validate([
            'status' => 'required|in:enrolled,completed,dropped,failed',
            'score' => 'nullable|integer|min:0|max:100',
            'feedback' => 'nullable|string|max:1000',
        ]);

        if ($data['status'] === 'completed' && ! $enrollment->completed_at) {
            $data['completed_at'] = now();
        }

        $enrollment->update($data);

        return back()->with('success', 'Enrollment updated.');
    }

    public function destroy(TrainingEnrollment $enrollment)
    {
        $enrollment->delete();

        return back()->with('success', 'Enrollment removed.');
    }
}
