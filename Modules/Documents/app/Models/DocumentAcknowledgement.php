<?php

namespace Modules\Documents\app\Models;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentAcknowledgement extends Model
{
    protected $fillable = ['document_id', 'employee_id', 'acknowledged_at'];

    protected $casts = ['acknowledged_at' => 'datetime'];

    public function document(): BelongsTo
    {
        return $this->belongsTo(CompanyDocument::class, 'document_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
