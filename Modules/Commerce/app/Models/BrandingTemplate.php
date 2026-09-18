<?php

namespace Modules\Commerce\app\Models;

use Illuminate\Database\Eloquent\Model;

class BrandingTemplate extends Model
{
    protected $table = 'branding_templates';

    protected $fillable = [
        'name', 'description', 'primary_color', 'secondary_color', 'login_background', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
