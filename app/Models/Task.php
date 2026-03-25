<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    public const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
    public const STATUSES = ['pending', 'in_progress', 'completed'];

    protected $fillable = [
        'parent_task_id',
        'created_by',
        'service_id',
        'client_id',
        'responsible_id',
        'priority',
        'status',
        'due_date',
        'instructions',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function responsible(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_id');
    }

    public function collaborators(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_collaborators')->withPivot('can_work')->withTimestamps();
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class)->latest();
    }

    public function parentTask(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function followUpTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }

    public function submission(): HasOne
    {
        return $this->hasOne(ServiceSubmission::class);
    }

    public function canUserWork(User $user): bool
    {
        if ($user->hasRole('admin') || $this->responsible_id === $user->id) {
            return true;
        }

        return $this->collaborators()
            ->where('users.id', $user->id)
            ->wherePivot('can_work', true)
            ->exists();
    }

    public function scopeVisibleTo($query, User $user): void
    {
        if ($user->hasRole('admin')) {
            return;
        }

        $query->where(function ($q) use ($user) {
            $q->where('created_by', $user->id)
              ->orWhere('responsible_id', $user->id)
              ->orWhereHas('collaborators', fn ($cq) => $cq->where('users.id', $user->id));
        });
    }
}
