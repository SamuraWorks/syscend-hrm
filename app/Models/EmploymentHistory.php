<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmploymentHistory extends Model
{
    protected $table = 'employment_history';

    public $timestamps = false;

    protected $fillable = ['employee_id', 'field_name', 'old_value', 'new_value', 'changed_by', 'changed_at'];

    protected $casts = ['changed_at' => 'datetime'];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
