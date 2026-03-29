<?php

namespace Tests\Feature;

use App\Models\TaskAttachment;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class TaskCommentAttachmentTest extends TestCase
{
    use RefreshDatabase, CreatesTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupBaseData();
        Storage::fake('public');
        Notification::fake();
    }

    // ── Comments ──

    public function test_participant_can_add_comment(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);

        $response = $this->actingAs($this->employeeUser)
            ->post(route('tasks.comments.store', $task), [
                'body' => 'This is a test comment.',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_comments', [
            'task_id' => $task->id,
            'user_id' => $this->employeeUser->id,
            'body' => 'This is a test comment.',
        ]);
    }

    public function test_comment_author_can_delete_own_comment(): void
    {
        $task = $this->createTask();
        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $this->employeeUser->id,
            'body' => 'To delete',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->delete(route('tasks.comments.destroy', [$task, $comment]));

        $response->assertRedirect();
        $this->assertSoftDeleted('task_comments', ['id' => $comment->id]);
    }

    public function test_admin_can_delete_any_comment(): void
    {
        $task = $this->createTask();
        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $this->employeeUser->id,
            'body' => 'Admin deletes this',
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('tasks.comments.destroy', [$task, $comment]));

        $response->assertRedirect();
        $this->assertSoftDeleted('task_comments', ['id' => $comment->id]);
    }

    public function test_user_cannot_delete_others_comment(): void
    {
        $task = $this->createTask();
        $otherUser = User::factory()->create();
        $otherUser->assignRole('employee');
        $task->collaborators()->attach($otherUser->id, ['can_work' => false]);

        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $this->employeeUser->id,
            'body' => 'Not yours',
        ]);

        $response = $this->actingAs($otherUser)
            ->delete(route('tasks.comments.destroy', [$task, $comment]));

        $response->assertForbidden();
    }

    public function test_non_participant_cannot_comment(): void
    {
        $task = $this->createTask();
        $outsider = User::factory()->create();
        $outsider->assignRole('employee');

        $response = $this->actingAs($outsider)
            ->post(route('tasks.comments.store', $task), [
                'body' => 'Should not work',
            ]);

        $response->assertForbidden();
    }

    // ── Attachments ──

    public function test_participant_can_upload_attachment(): void
    {
        $task = $this->createTask();
        $file = UploadedFile::fake()->create('report.pdf', 1000, 'application/pdf');

        $response = $this->actingAs($this->employeeUser)
            ->post(route('tasks.attachments.store', $task), [
                'attachments' => [$file],
            ]);

        $response->assertRedirect();
        $this->assertCount(1, $task->fresh()->attachments);
    }

    public function test_uploader_can_delete_own_attachment(): void
    {
        $task = $this->createTask();
        $file = UploadedFile::fake()->create('doc.pdf', 100);
        $path = $file->store('task-attachments', 'public');

        $attachment = TaskAttachment::create([
            'task_id' => $task->id,
            'uploaded_by' => $this->employeeUser->id,
            'file_path' => $path,
            'original_name' => 'doc.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 100,
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->delete(route('tasks.attachments.destroy', [$task, $attachment]));

        $response->assertRedirect();
        $this->assertDatabaseMissing('task_attachments', ['id' => $attachment->id]);
    }

    public function test_non_participant_cannot_upload_attachment(): void
    {
        $task = $this->createTask();
        $outsider = User::factory()->create();
        $outsider->assignRole('employee');

        $file = UploadedFile::fake()->create('hack.pdf', 100);

        $response = $this->actingAs($outsider)
            ->post(route('tasks.attachments.store', $task), [
                'attachments' => [$file],
            ]);

        $response->assertForbidden();
    }
}
