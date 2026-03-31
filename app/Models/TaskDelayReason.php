<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskDelayReason extends Model
{
    public const REASONS = [
        'waiting_client_documents',
        'waiting_manager_input',
        'workload_capacity',
        'client_unresponsive',
        'pending_clarification',
        'technical_issue',
        'other',
    ];

    public const REASON_LABELS = [
        'waiting_client_documents' => 'Waiting for client documents',
        'waiting_manager_input' => 'Waiting for manager/team input',
        'workload_capacity' => 'Workload/capacity issue',
        'client_unresponsive' => 'Client unresponsive',
        'pending_clarification' => 'Pending clarification',
        'technical_issue' => 'Technical/system issue',
        'other' => 'Other',
    ];

    public const STATUSES = ['pending', 'approved', 'rejected'];

    protected $fillable = [
        'task_id',
        'user_id',
        'reason',
        'reason_detail',
        'original_due_date',
        'proposed_due_date',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
    ];

    protected function casts(): array
    {
        return [
            'original_due_date' => 'date',
            'proposed_due_date' => 'date',
            'reviewed_at' => 'datetime',
        ];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
