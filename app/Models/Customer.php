<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Customer extends Model
{
    protected $fillable = [
        'user_id',
        'phone',
        'address_line',
        'city',
        'emirate',
        'country',
        'po_box',
        'legal_type',
        'trade_license_no',
        'issuing_authority',
        'contact_person_name',
        'telephone',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(CustomerDocument::class);
    }

    public function partners(): HasMany
    {
        return $this->hasMany(CustomerPartner::class);
    }

    public function branches(): HasMany
    {
        return $this->hasMany(CustomerBranch::class);
    }

    public function bankDetail(): HasOne
    {
        return $this->hasOne(CustomerBankDetail::class);
    }

    public function bankDetails(): HasMany
    {
        return $this->hasMany(CustomerBankDetail::class);
    }
}
