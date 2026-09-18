<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\PerformanceCycle;
use App\Models\PerformanceRating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PerformanceController extends ApiController
{
    /**
     * List all performance cycles with ratings count.
     */
    public function cycles(): JsonResponse
    {
        return $this->success(
            PerformanceCycle::withCount('ratings')->orderByDesc('start_date')->get()
        );
    }

    /**
     * Show a single cycle with its ratings.
     */
    public function showCycle(PerformanceCycle $cycle): JsonResponse
    {
        return $this->success(
            $cycle->load('ratings.employee:id,first_name,last_name')
        );
    }

    /**
     * List performance ratings — paginated with filters.
     */
    public function ratings(Request $request): JsonResponse
    {
        $query = PerformanceRating::with('employee:id,first_name,last_name')
            ->when($request->cycle_id, fn ($q, $v) => $q->where('cycle_id', $v))
            ->when($request->employee_id, fn ($q, $v) => $q->where('employee_id', $v))
            ->orderByDesc('created_at');

        return $this->paginated($query->paginate(15));
    }

    /**
     * Show a single rating with employee and cycle.
     */
    public function showRating(PerformanceRating $rating): JsonResponse
    {
        return $this->success(
            $rating->load(['employee:id,first_name,last_name', 'cycle'])
        );
    }
}
