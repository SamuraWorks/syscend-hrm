<?php

namespace Modules\Attendance\app\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = ['name', 'date', 'is_recurring', 'type', 'description'];

    protected $casts = ['is_recurring' => 'boolean', 'date' => 'date'];
}
