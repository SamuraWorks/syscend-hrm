<?php

namespace Modules\Commerce\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deployment extends Model
{
    protected $table = 'deployments';

    public const STATUSES = ['queued', 'provisioning', 'ready', 'deployed', 'failed'];

    /** Standard deployment steps offered on the website (order matters). */
    public const DEFAULT_STEPS = [
        'Server / VPS setup',
        'Application installation',
        'Database configuration',
        'Environment configuration',
        'SSL certificate',
        'Domain configuration',
        'Production hardening',
        'Initial system configuration',
    ];

    protected $fillable = [
        'organization_id', 'license_id', 'status', 'domain', 'ssl',
        'server_details', 'steps', 'notes',
    ];

    protected $casts = [
        'ssl' => 'boolean',
        'server_details' => 'array',
        'steps' => 'array',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function license(): BelongsTo
    {
        return $this->belongsTo(License::class);
    }
}
