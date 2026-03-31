<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskDelayReason;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TaskDelayReasonController extends Controller
{
    public function store(Request $request, Task $task): RedirectResponse
    {
        $user = $request->user();

        abort_unless($task->canUserWork($user), 403);
        abort_if($task->status === 'completed', 422, 'Cannot report delay on a completed task.');

        $validated = $request->validate([
            'reason' => 'required|in:' . implode(',', TaskDelayReason::REASONS),
            'reason_detail' => 'required_if:reason,other|nullable|string|max:2000',
            'proposed_due_date' => 'nullable|date|after:today',
        ]);

        TaskDelayReason::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'reason' => $validated['reason'],
            'reason_detail' => $validated['reason_detail'] ?? null,
            'original_due_date' => $task->due_date,
            'proposed_due_date' => $validated['proposed_due_date'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Delay reason submitted successfully.');
    }

    public function review(Request $request, Task $task, TaskDelayReason $delayReason): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user->hasRole('admin') || $task->created_by === $user->id, 403);
        abort_if($delayReason->task_id !== $task->id, 404);
        abort_if($delayReason->status !== 'pending', 422, 'This delay reason has already been reviewed.');

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'review_notes' => 'nullable|string|max:2000',
        ]);

        $delayReason->update([
            'status' => $validated['status'],
            'review_notes' => $validated['review_notes'] ?? null,
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        if ($validated['status'] === 'approved' && $delayReason->proposed_due_date) {
            $task->update(['due_date' => $delayReason->proposed_due_date]);
        }

        return back()->with('success', 'Delay reason ' . $validated['status'] . '.');
    }
}
