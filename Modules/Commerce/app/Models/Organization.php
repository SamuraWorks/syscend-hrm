<?php

namespace Modules\Commerce\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    protected $table = 'organizations';

    protected $fillable = [
        'name', 'short_name', 'industry', 'country', 'website', 'size',
        'contact_name', 'contact_position', 'contact_email', 'contact_phone',
        'email', 'phone', 'address',
        'logo_path', 'favicon_path', 'primary_color', 'secondary_color',
        'login_background', 'login_welcome', 'footer_copyright', 'notes',
    ];

    public function purchaseRequests(): HasMany
    {
        return $this->hasMany(PurchaseRequest::class);
    }

    public function licenses(): HasMany
    {
        return $this->hasMany(License::class);
    }

    public function deployments(): HasMany
    {
        return $this->hasMany(Deployment::class);
    }
}
