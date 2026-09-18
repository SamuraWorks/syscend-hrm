<?php

namespace Modules\Commerce\app\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';

    protected $fillable = [
        'name', 'description', 'category', 'type', 'price', 'yearly_price', 'currency',
        'one_time', 'is_active', 'sort', 'notes',
    ];

    protected $casts = [
        'price' => 'float',
        'yearly_price' => 'float',
        'one_time' => 'boolean',
        'is_active' => 'boolean',
    ];
}
