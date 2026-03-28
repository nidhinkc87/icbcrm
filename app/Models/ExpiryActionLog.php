<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpiryActionLog extends Model
{
    protected $fillable = [
        'rule_id',
        'customer_id',
        'customer_document_id',
        'expiry_date',
        'action_taken',
        'task_id',
    ];

    protected function casts(): array
    {
        return [
            'expiry_date' => 'date',
        ];
    }

    public function rule(): BelongsTo
    {
        return $this->belongsTo(ExpiryActionRule::class, 'rule_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(CustomerDocument::class, 'customer_document_id');
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
