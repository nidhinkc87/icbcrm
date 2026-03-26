<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskQueryResponse extends Model
{
    protected $fillable = [
        'query_id',
        'user_id',
        'body',
        'attachment_path',
        'attachment_name',
    ];

    public function taskQuery(): BelongsTo
    {
        return $this->belongsTo(TaskQuery::class, 'query_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
