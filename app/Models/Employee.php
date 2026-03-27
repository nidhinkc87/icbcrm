<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    protected $fillable = [
        'user_id',
        'phone',
        'personal_email',
        'contact_number',
        'department',
        'designation',
        'date_of_joining',
        'emergency_contact_name',
        'emergency_contact_number',
        'emergency_contact_relationship',
        'local_address_line',
        'local_city',
        'local_emirate',
        'local_po_box',
        'home_address_line',
        'home_city',
        'home_state',
        'home_country',
        'home_postal_code',
        'home_contact_number',
        'photo',
        'passport',
        'emirates_id',
        'visa',
        'driving_id',
        'insurance',
        'education_certificates',
        'offer_letter',
        'labour_contract',
        'nda',
        'handbook',
        'personal_goal',
        'professional_goal',
        'submission_date',
    ];

    protected function casts(): array
    {
        return [
            'date_of_joining' => 'date',
            'submission_date' => 'date',
            'education_certificates' => 'array',
            'personal_goal' => 'array',
            'professional_goal' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
