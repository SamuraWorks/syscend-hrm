<?php

namespace Modules\Commerce\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseRequestItem extends Model
{
    protected $table = 'purchase_request_items';

    protected $fillable = [
        'purchase_request_id', 'product_id', 'product_name', 'category',
        'unit_price', 'qty', 'line_total', 'term', 'period_months',
    ];

    protected $casts = [
        'unit_price' => 'float',
        'line_total' => 'float',
        'period_months' => 'integer',
    ];

    public function purchaseRequest(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequest::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
