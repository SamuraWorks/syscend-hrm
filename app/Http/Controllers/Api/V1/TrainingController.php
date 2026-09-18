<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Training\app\Models\TrainingCourse;
use Modules\Training\app\Models\TrainingEnrollment;
use Modules\Training\app\Models\TrainingSession;

class TrainingController extends ApiController
{
    /**
     * List training courses — paginated with filters.
     */
    public function courses(Request $request): JsonResponse
    {
        $query = TrainingCourse::query()
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->category, fn ($q, $v) => $q->where('category', $v))
            ->orderByDesc('created_at');

        return $this->paginated($query->paginate(15));
    }

    /**
     * Show a single course with its sessions.
     */
    public function showCourse(TrainingCourse $course): JsonResponse
    {
        return $this->success($course->load('sessions'));
    }

    /**
     * List training sessions — paginated with filters.
     */
    public function sessions(Request $request): JsonResponse
    {
        $query = TrainingSession::with('course:id,title')
            ->when($request->course_id, fn ($q, $v) => $q->where('course_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('start_date');

        return $this->paginated($query->paginate(15));
    }

    /**
     * List enrollments — paginated with filters.
     */
    public function enrollments(Request $request): JsonResponse
    {
        $query = TrainingEnrollment::with([
            'session:id,title,course_id',
            'employee:id,first_name,last_name',
        ])
            ->when($request->session_id, fn ($q, $v) => $q->where('session_id', $v))
            ->when($request->employee_id, fn ($q, $v) => $q->where('employee_id', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('created_at');

        return $this->paginated($query->paginate(15));
    }

    /**
     * Enroll an employee in a training session.
     */
    public function enroll(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:training_sessions,id',
            'employee_id' => 'required|exists:employees,id',
        ]);

        $existing = TrainingEnrollment::where('session_id', $validated['session_id'])
            ->where('employee_id', $validated['employee_id'])
            ->first();

        if ($existing) {
            return $this->error('Employee is already enrolled in this session.');
        }

        $enrollment = TrainingEnrollment::create(array_merge($validated, [
            'status' => 'enrolled',
        ]));

        return $this->success(
            $enrollment->load(['session:id,title', 'employee:id,first_name,last_name']),
            'Enrollment created successfully',
            201
        );
    }

    /**
     * Mark an enrollment as completed.
     */
    public function complete(Request $request, TrainingEnrollment $enrollment): JsonResponse
    {
        $request->validate([
            'score' => 'nullable|integer|min:0|max:100',
            'feedback' => 'nullable|string|max:1000',
        ]);

        $enrollment->update([
            'status' => 'completed',
            'score' => $request->score,
            'feedback' => $request->feedback,
            'completed_at' => now(),
        ]);

        return $this->success($enrollment->fresh(), 'Enrollment marked as completed');
    }
}
