<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobApplication extends Model
{
    protected $fillable = [
        'job_posting_id', 'first_name', 'last_name', 'email', 'phone',
        'resume_path', 'cover_letter', 'current_company', 'current_title',
        'experience_years', 'stage', 'notes', 'rating',
    ];

    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class);
    }

    public function interviews(): HasMany
    {
        return $this->hasMany(InterviewSchedule::class);
    }
}
