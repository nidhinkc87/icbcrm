<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentType extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'category',
        'has_expiry',
        'has_file',
        'has_value',
        'is_required',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'has_expiry' => 'boolean',
            'has_file' => 'boolean',
            'has_value' => 'boolean',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function customerDocuments(): HasMany
    {
        return $this->hasMany(CustomerDocument::class);
    }

    public function expiryRules(): HasMany
    {
        return $this->hasMany(ExpiryActionRule::class);
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'service_document_types')
            ->withPivot('is_required')
            ->withTimestamps();
    }
}
