<?php

namespace Modules\Performance\app\Models;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceRating extends Model
{
    protected $fillable = [
        'employee_id', 'cycle_id',
        'self_score', 'manager_score', 'final_score',
        'rating_label', 'finalised_by', 'finalised_at',
    ];

    protected $casts = [
        'finalised_at' => 'datetime',
        'self_score' => 'float',
        'manager_score' => 'float',
        'final_score' => 'float',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(PerformanceCycle::class, 'cycle_id');
    }

    public function finalisedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finalised_by');
    }

    public static function labelFromScore(float $score): string
    {
        return match (true) {
            $score >= 4.5 => 'Outstanding',
            $score >= 3.5 => 'Excellent',
            $score >= 2.5 => 'Good',
            $score >= 1.5 => 'Average',
            default => 'Poor',
        };
    }
}
