<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceReviewItem extends Model
{
    protected $fillable = ['review_id', 'criteria', 'rating', 'comments'];

    protected $casts = ['rating' => 'integer'];

    public function review(): BelongsTo
    {
        return $this->belongsTo(PerformanceReview::class, 'review_id');
    }
}
