<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerDocument extends Model
{
    protected $fillable = [
        'customer_id',
        'document_type_id',
        'partner_id',
        'branch_id',
        'value',
        'file_path',
        'original_name',
        'issue_date',
        'expiry_date',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'expiry_date' => 'date',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(CustomerPartner::class, 'partner_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(CustomerBranch::class, 'branch_id');
    }
}
