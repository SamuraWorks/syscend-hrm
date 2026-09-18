<?php

namespace Modules\Commerce\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseRequest extends Model
{
    protected $table = 'purchase_requests';

    public const STATUSES = [
        'draft', 'submitted', 'awaiting_payment', 'payment_confirmed',
        'license_issued', 'configuration', 'deployment', 'training',
        'completed', 'cancelled',
    ];

    /** Steps shown on the public progress timeline. */
    public const TIMELINE = [
        'submitted' => 'Request Submitted',
        'awaiting_payment' => 'Payment',
        'payment_confirmed' => 'Payment',
        'license_issued' => 'License Issued',
        'configuration' => 'Configuration',
        'deployment' => 'Deployment',
        'training' => 'Training',
        'completed' => 'Completed',
    ];

    protected $fillable = [
        'reference', 'organization_id', 'status', 'currency',
        'subtotal', 'total', 'payment_note', 'submitted_at',
        'payment_confirmed_at', 'paid_at', 'notes',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'total' => 'float',
        'submitted_at' => 'datetime',
        'payment_confirmed_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseRequestItem::class);
    }

    /** Generate the next reference like SHRM-2026-0001. */
    public static function generateReference(): string
    {
        $year = date('Y');
        $count = static::whereYear('created_at', $year)->count() + 1;

        return sprintf('SHRM-%s-%04d', $year, $count);
    }

    /** Resolve the current timeline index (excluding draft/cancelled). */
    public function timelinePosition(): int
    {
        if ($this->status === 'cancelled') {
            return -1;
        }
        $keys = array_keys(self::TIMELINE);
        $index = array_search($this->status, $keys, true);

        if ($this->status === 'submitted') {
            $index = 1; // submitted shown as the first completed step
        }

        return $index === false ? 0 : max(0, $index);
    }
}
