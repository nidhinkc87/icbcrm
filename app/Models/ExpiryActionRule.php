<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpiryActionRule extends Model
{
    protected $fillable = [
        'name',
        'document_type_id',
        'trigger_days_before',
        'action',
        'service_id',
        'assignment_strategy',
        'assigned_employee_id',
        'notify_customer',
        'notify_admin',
        'priority',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'notify_customer' => 'boolean',
            'notify_admin' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function assignedEmployee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_employee_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ExpiryActionLog::class, 'rule_id');
    }
}
