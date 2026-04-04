<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CalendarEvent extends Model
{
    protected $fillable = [
        'created_by', 'title', 'description', 'type',
        'location', 'date', 'start_time', 'end_time', 'all_day',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'all_day' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'calendar_event_participants')->withTimestamps();
    }

    public function scopeVisibleTo($query, User $user): void
    {
        if ($user->hasRole('admin')) {
            return;
        }

        $query->where(function ($q) use ($user) {
            $q->where('created_by', $user->id)
              ->orWhereHas('participants', fn ($pq) => $pq->where('users.id', $user->id));
        });
    }
}
