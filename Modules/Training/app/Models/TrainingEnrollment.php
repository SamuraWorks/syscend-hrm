<?php

namespace Modules\Training\app\Models;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingEnrollment extends Model
{
    protected $fillable = [
        'session_id', 'employee_id', 'status', 'score', 'feedback', 'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'score' => 'integer',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(TrainingSession::class, 'session_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
