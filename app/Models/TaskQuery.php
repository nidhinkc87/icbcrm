<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaskQuery extends Model
{
    public const PRIORITIES = ['normal', 'urgent'];
    public const STATUSES = ['open', 'answered', 'closed'];

    protected $fillable = [
        'task_id',
        'raised_by',
        'directed_to',
        'subject',
        'description',
        'priority',
        'status',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function raisedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'raised_by');
    }

    public function directedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'directed_to');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(TaskQueryResponse::class, 'query_id');
    }
}
