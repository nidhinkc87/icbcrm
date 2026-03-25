<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TaskAttachmentController extends Controller
{
    public function store(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTaskAccess($task);

        $validated = $request->validate([
            'attachments' => 'required|array|max:5',
            'attachments.*' => 'file|max:20480|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx',
        ]);

        foreach ($request->file('attachments') as $file) {
            $path = $file->store("task-attachments/{$task->id}", 'public');
            $task->attachments()->create([
                'uploaded_by' => auth()->id(),
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }

        return back()->with('success', 'Attachments uploaded successfully.');
    }

    public function destroy(Task $task, TaskAttachment $attachment): RedirectResponse
    {
        abort_unless($attachment->task_id === $task->id, 404);

        $user = auth()->user();
        abort_unless($attachment->uploaded_by === $user->id || $user->hasRole('admin'), 403);

        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return back()->with('success', 'Attachment deleted.');
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
