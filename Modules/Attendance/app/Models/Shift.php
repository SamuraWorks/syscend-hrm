<?php

namespace Modules\Attendance\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shift extends Model
{
    protected $fillable = ['name', 'start_time', 'end_time', 'break_minutes', 'color', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
