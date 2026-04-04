<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Partner extends Model
{
    protected $table = 'partner_profiles';

    protected $fillable = [
        'user_id', 'phone', 'company',
        'legal_type', 'trade_license_no', 'issuing_authority',
        'trade_license_file', 'trade_license_issue_date', 'trade_license_expiry_date',
        'moa_file', 'moa_issue_date',
        'bank_name', 'bank_branch', 'account_number', 'iban',
        'address_line', 'city', 'emirate', 'country', 'po_box',
        'contact_person_name', 'telephone',
    ];

    protected function casts(): array
    {
        return [
            'trade_license_issue_date' => 'date',
            'trade_license_expiry_date' => 'date',
            'moa_issue_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customers(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class, 'partner_customers')->withTimestamps();
    }
}
