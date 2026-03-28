<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerBankDetail extends Model
{
    protected $fillable = [
        'customer_id',
        'bank_name',
        'branch',
        'account_number',
        'iban',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
