<?php

namespace Modules\Commerce\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class License extends Model
{
    protected $table = 'licenses';

    public const STATUSES = ['pending', 'active', 'suspended', 'expired', 'revoked'];

    protected $fillable = [
        'license_key', 'organization_id', 'license_type', 'status',
        'issued_at', 'expires_at', 'installation_id', 'product', 'notes',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public static function generateKey(): string
    {
        $segments = [];
        for ($i = 0; $i < 4; $i++) {
            $segments[] = strtoupper(substr(bin2hex(random_bytes(3)), 0, 4));
        }

        return 'SHRM-'.implode('-', $segments);
    }
}
