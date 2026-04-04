<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TaskQueryController extends Controller
{
    public function store(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTaskAccess($task);

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'directed_to' => 'nullable|exists:users,id',
            'priority' => 'required|in:' . implode(',', TaskQuery::PRIORITIES),
        ]);

        TaskQuery::create([
            'task_id' => $task->id,
            'raised_by' => auth()->id(),
            'directed_to' => $validated['directed_to'] ?? null,
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'status' => 'open',
        ]);

        return back()->with('success', 'Query raised successfully.');
    }

    public function show(Task $task, TaskQuery $query): Response
    {
        $this->authorizeTaskAccess($task);
        abort_if($query->task_id !== $task->id, 404);

        $query->load(['raisedBy:id,name', 'directedTo:id,name', 'responses.user:id,name']);

        $user = auth()->user();

        return Inertia::render('Tasks/QueryShow', [
            'task' => [
                'id' => $task->id,
                'service_name' => $task->service?->name ?? 'Unknown',
            ],
            'query' => [
                'id' => $query->id,
                'subject' => $query->subject,
                'description' => $query->description,
                'priority' => $query->priority,
                'status' => $query->status,
                'raised_by_name' => $query->raisedBy?->name ?? 'Unknown',
                'raised_by_id' => $query->raised_by,
                'directed_to_name' => $query->directedTo?->name ?? null,
                'directed_to_id' => $query->directed_to,
                'created_at' => $query->created_at->format('M d, Y H:i'),
                'can_close' => $query->raised_by === $user->id || $user->hasRole('admin'),
                'responses' => $query->responses->map(fn ($r) => [
                    'id' => $r->id,
                    'body' => $r->body,
                    'user_name' => $r->user?->name ?? 'Unknown',
                    'user_initials' => collect(explode(' ', $r->user?->name ?? 'U'))->map(fn ($n) => $n[0] ?? '')->join(''),
                    'attachment_url' => $r->attachment_path ? Storage::disk('public')->url($r->attachment_path) : null,
                    'attachment_name' => $r->attachment_name,
                    'created_at' => $r->created_at->diffForHumans(),
                ]),
            ],
        ]);
    }

    public function respond(Request $request, Task $task, TaskQuery $query): RedirectResponse
    {
        $this->authorizeTaskAccess($task);
        abort_if($query->task_id !== $task->id, 404);
        abort_if($query->status === 'closed', 403, 'Cannot respond to a closed query.');

        $validated = $request->validate([
            'body' => 'required|string|max:5000',
            'attachment' => 'nullable|file|max:20480',
        ]);

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentPath = $file->store("query-attachments/{$query->id}", 'public');
            $attachmentName = $file->getClientOriginalName();
        }

        $query->responses()->create([
            'user_id' => auth()->id(),
            'body' => $validated['body'],
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
        ]);

        // Auto-update status if the directed-to person responds
        if ($query->status === 'open' && $query->directed_to === auth()->id()) {
            $query->update(['status' => 'answered']);
        }

        return back()->with('success', 'Response posted.');
    }

    public function close(Task $task, TaskQuery $query): RedirectResponse
    {
        $this->authorizeTaskAccess($task);
        abort_if($query->task_id !== $task->id, 404);

        $user = auth()->user();
        abort_unless($query->raised_by === $user->id || $user->hasRole('admin'), 403);

        $query->update(['status' => 'closed']);

        return back()->with('success', 'Query closed.');
    }

    public function reopen(Task $task, TaskQuery $query): RedirectResponse
    {
        $this->authorizeTaskAccess($task);
        abort_if($query->task_id !== $task->id, 404);

        $user = auth()->user();
        abort_unless($query->raised_by === $user->id || $user->hasRole('admin'), 403);

        $query->update(['status' => 'open']);

        return back()->with('success', 'Query reopened.');
    }

    private function authorizeTaskAccess(Task $task): void
    {
        $user = auth()->user();

        if ($user->hasRole('admin')) {
            return;
        }

        $hasAccess = $task->created_by === $user->id
            || $task->responsible_id === $user->id
            || $task->collaborators()->where('users.id', $user->id)->exists()
            || ($task->customer && $task->customer->user_id === $user->id)
            || ($user->hasRole('partner') && $task->customer && $task->customer->partnerUsers()->where('partner_profiles.user_id', $user->id)->exists());

        abort_unless($hasAccess, 403);
    }
}
