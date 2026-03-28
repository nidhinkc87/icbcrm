<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'description', 'form_schema', 'completion_schema', 'is_active'])]
class Service extends Model
{
    public function documentTypes(): BelongsToMany
    {
        return $this->belongsToMany(DocumentType::class, 'service_document_types')
            ->withPivot('is_required')
            ->withTimestamps();
    }

    protected function casts(): array
    {
        return [
            'form_schema' => 'array',
            'completion_schema' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ServiceSubmission::class);
    }
}
