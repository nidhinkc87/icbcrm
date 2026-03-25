<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    public function store(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTaskAccess($task);

        $validated = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $task->comments()->create([
            'user_id' => auth()->id(),
            'body' => $validated['body'],
        ]);

        return back()->with('success', 'Comment added.');
    }

    public function destroy(Task $task, TaskComment $comment): RedirectResponse
    {
        abort_unless($comment->task_id === $task->id, 404);

        $user = auth()->user();
        abort_unless($comment->user_id === $user->id || $user->hasRole('admin'), 403);

        $comment->delete();

        return back()->with('success', 'Comment deleted.');
    }

    private function authorizeTaskAccess(Task $task): void
    {
        $user = auth()->user();

        if ($user->hasRole('admin')) {
            return;
        }

        $hasAccess = $task->created_by === $user->id
            || $task->responsible_id === $user->id
            || $task->collaborators()->where('users.id', $user->id)->exists();

        abort_unless($hasAccess, 403);
    }
}
