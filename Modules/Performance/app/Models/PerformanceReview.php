<?php

namespace Modules\Performance\app\Models;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformanceReview extends Model
{
    protected $fillable = [
        'employee_id', 'cycle_id', 'reviewer_id',
        'type', 'status', 'overall_comments', 'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'reviewer_id');
    }

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(PerformanceCycle::class, 'cycle_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PerformanceReviewItem::class, 'review_id');
    }

    public function averageRating(): float
    {
        $items = $this->items;
        if ($items->isEmpty()) {
            return 0;
        }

        return round($items->avg('rating'), 2);
    }
}
