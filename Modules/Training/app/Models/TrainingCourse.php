<?php

namespace Modules\Training\app\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingCourse extends Model
{
    protected $fillable = [
        'title', 'description', 'category', 'delivery_mode',
        'duration_hours', 'provider', 'cost', 'status', 'created_by',
    ];

    protected $casts = [
        'cost' => 'float',
        'duration_hours' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class, 'course_id');
    }
}
