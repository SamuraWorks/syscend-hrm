<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SalaryComponent extends Model
{
    protected $fillable = [
        'name', 'code', 'type', 'calculation_type', 'value',
        'description', 'is_taxable', 'is_active',
    ];

    protected $casts = [
        'is_taxable' => 'boolean',
        'is_active' => 'boolean',
        'value' => 'decimal:2',
    ];

    public function structures(): BelongsToMany
    {
        return $this->belongsToMany(SalaryStructure::class, 'salary_structure_components')
            ->withPivot('override_value')
            ->withTimestamps();
    }
}
