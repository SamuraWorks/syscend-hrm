<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterviewSchedule extends Model
{
    protected $fillable = [
        'job_application_id', 'title', 'scheduled_at', 'duration_minutes',
        'mode', 'location_or_link', 'interviewer_name', 'status', 'feedback', 'rating',
    ];

    protected $casts = ['scheduled_at' => 'datetime'];

    public function application(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class, 'job_application_id');
    }
}
