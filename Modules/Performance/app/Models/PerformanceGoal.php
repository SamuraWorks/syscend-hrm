<?php

namespace Modules\Performance\app\Models;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceGoal extends Model
{
    protected $fillable = [
        'employee_id', 'cycle_id', 'title', 'description',
        'weight', 'progress', 'status', 'due_date',
    ];

    protected $casts = [
        'due_date' => 'date',
        'weight' => 'integer',
        'progress' => 'integer',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(PerformanceCycle::class, 'cycle_id');
    }
}
