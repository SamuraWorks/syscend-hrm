<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveBalance extends Model
{
    protected $fillable = ['employee_id', 'leave_type_id', 'year', 'entitled', 'used', 'pending', 'carried_forward'];

    protected $casts = [
        'entitled' => 'float',
        'used' => 'float',
        'pending' => 'float',
        'carried_forward' => 'float',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function getAvailableAttribute(): float
    {
        return max(0, $this->entitled + $this->carried_forward - $this->used - $this->pending);
    }
}
