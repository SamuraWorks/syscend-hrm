<?php

namespace App\Http\Controllers\Performance;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\PerformanceCycle;
use App\Models\PerformanceRating;
use App\Models\PerformanceReview;
use App\Models\PerformanceReviewItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PerformanceReviewController extends Controller
{
    // Default criteria used for all reviews
    const DEFAULT_CRITERIA = [
        'Job Knowledge',
        'Quality of Work',
        'Productivity',
        'Communication',
        'Teamwork',
        'Initiative',
        'Attendance & Punctuality',
    ];

    /**
     * Start (or resume) a review for an employee in a cycle.
     * Called by the cycle detail page.
     */
    public function startOrShow(Request $request, PerformanceCycle $cycle, Employee $employee)
    {
        $type = $request->query('type', 'self'); // self | manager
        abort_if(! in_array($type, ['self', 'manager']), 422);

        // For self-review: reviewer is the employee themselves
        // For manager-review: reviewer is the logged-in user's employee record
        $reviewerEmployee = Employee::where('user_id', $request->user()->id)->first();

        if ($type === 'self') {
            $reviewerId = $employee->id;
        } else {
            abort_if(! $reviewerEmployee, 403, 'No employee record found for your account.');
            $reviewerId = $reviewerEmployee->id;
        }

        $review = PerformanceReview::firstOrCreate(
            [
                'employee_id' => $employee->id,
                'cycle_id' => $cycle->id,
                'type' => $type,
            ],
            [
                'reviewer_id' => $reviewerId,
                'status' => 'pending',
            ]
        );

        // Seed default criteria items if none exist yet
        if ($review->items()->count() === 0) {
            foreach (self::DEFAULT_CRITERIA as $criteria) {
                PerformanceReviewItem::create([
                    'review_id' => $review->id,
                    'criteria' => $criteria,
                    'rating' => 3,
                    'comments' => null,
                ]);
            }
        }

        return redirect("/performance/reviews/{$review->id}");
    }

    public function show(PerformanceReview $review)
    {
        $review->load(['employee.department', 'employee.position', 'cycle', 'items']);

        return Inertia::render('performance/reviews/Show', [
            'review' => [
                'id' => $review->id,
                'type' => $review->type,
                'status' => $review->status,
                'overall_comments' => $review->overall_comments,
                'submitted_at' => $review->submitted_at?->format('d M Y H:i'),
                'cycle' => [
                    'id' => $review->cycle->id,
                    'name' => $review->cycle->name,
                    'status' => $review->cycle->status,
                ],
                'employee' => [
                    'id' => $review->employee->id,
                    'name' => $review->employee->first_name.' '.$review->employee->last_name,
                    'employee_code' => $review->employee->employee_id,
                    'department' => $review->employee->department?->name,
                    'position' => $review->employee->position?->name,
                ],
                'items' => $review->items->map(fn ($i) => [
                    'id' => $i->id,
                    'criteria' => $i->criteria,
                    'rating' => $i->rating,
                    'comments' => $i->comments,
                ]),
            ],
        ]);
    }

    /**
     * Save item ratings (auto-save, no status change).
     */
    public function save(Request $request, PerformanceReview $review)
    {
        abort_if($review->status === 'finalised', 403, 'Review is already finalised.');

        $data = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:performance_review_items,id',
            'items.*.rating' => 'required|integer|min:1|max:5',
            'items.*.comments' => 'nullable|string|max:500',
            'overall_comments' => 'nullable|string|max:1000',
        ]);

        foreach ($data['items'] as $item) {
            PerformanceReviewItem::where('id', $item['id'])
                ->where('review_id', $review->id)
                ->update(['rating' => $item['rating'], 'comments' => $item['comments'] ?? null]);
        }

        $review->update(['overall_comments' => $data['overall_comments'] ?? null]);

        return back()->with('success', 'Review saved.');
    }

    /**
     * Submit the review (locks it as submitted).
     */
    public function submit(Request $request, PerformanceReview $review)
    {
        abort_if($review->status !== 'pending', 403, 'Review already submitted.');

        $data = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:performance_review_items,id',
            'items.*.rating' => 'required|integer|min:1|max:5',
            'items.*.comments' => 'nullable|string|max:500',
            'overall_comments' => 'nullable|string|max:1000',
        ]);

        foreach ($data['items'] as $item) {
            PerformanceReviewItem::where('id', $item['id'])
                ->where('review_id', $review->id)
                ->update(['rating' => $item['rating'], 'comments' => $item['comments'] ?? null]);
        }

        $review->update([
            'overall_comments' => $data['overall_comments'] ?? null,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        // Update the PerformanceRating score for this review type
        $this->syncRating($review);

        return redirect("/performance/cycles/{$review->cycle_id}")
            ->with('success', 'Review submitted successfully.');
    }

    /**
     * HR/Admin finalises a rating for an employee in a cycle.
     */
    public function finalise(Request $request, PerformanceCycle $cycle, Employee $employee)
    {
        $data = $request->validate([
            'final_score' => 'required|numeric|min:1|max:5',
        ]);

        $rating = PerformanceRating::firstOrNew([
            'employee_id' => $employee->id,
            'cycle_id' => $cycle->id,
        ]);

        $rating->final_score = $data['final_score'];
        $rating->rating_label = PerformanceRating::labelFromScore($data['final_score']);
        $rating->finalised_by = $request->user()->id;
        $rating->finalised_at = now();
        $rating->save();

        // Mark manager review as finalised
        PerformanceReview::where('employee_id', $employee->id)
            ->where('cycle_id', $cycle->id)
            ->where('type', 'manager')
            ->where('status', 'submitted')
            ->update(['status' => 'finalised']);

        return back()->with('success', 'Rating finalised.');
    }

    private function syncRating(PerformanceReview $review): void
    {
        $avg = round($review->items()->avg('rating'), 2);

        $rating = PerformanceRating::firstOrNew([
            'employee_id' => $review->employee_id,
            'cycle_id' => $review->cycle_id,
        ]);

        if ($review->type === 'self') {
            $rating->self_score = $avg;
        } else {
            $rating->manager_score = $avg;
        }

        $rating->save();
    }
}
