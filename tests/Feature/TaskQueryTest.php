<?php

namespace Tests\Feature;

use App\Models\TaskQuery;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class TaskQueryTest extends TestCase
{
    use RefreshDatabase, CreatesTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupBaseData();
        Storage::fake('public');
        Notification::fake();
    }

    public function test_responsible_can_raise_query(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);

        $response = $this->actingAs($this->employeeUser)
            ->post(route('tasks.queries.store', $task), [
                'subject' => 'Clarification needed',
                'description' => 'What is the correct TRN?',
                'priority' => 'normal',
                'directed_to' => $this->admin->id,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_queries', [
            'task_id' => $task->id,
            'subject' => 'Clarification needed',
            'status' => 'open',
        ]);
    }

    public function test_directed_user_can_respond(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);
        $query = TaskQuery::create([
            'task_id' => $task->id,
            'raised_by' => $this->employeeUser->id,
            'directed_to' => $this->admin->id,
            'subject' => 'Question',
            'description' => 'Details?',
            'priority' => 'normal',
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('tasks.queries.respond', [$task, $query]), [
                'body' => 'Here is the answer.',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_query_responses', [
            'query_id' => $query->id,
            'body' => 'Here is the answer.',
        ]);
    }

    public function test_auto_answered_when_directed_user_responds(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);
        $query = TaskQuery::create([
            'task_id' => $task->id,
            'raised_by' => $this->employeeUser->id,
            'directed_to' => $this->admin->id,
            'subject' => 'Auto answer test',
            'description' => 'Test',
            'priority' => 'normal',
            'status' => 'open',
        ]);

        $this->actingAs($this->admin)
            ->post(route('tasks.queries.respond', [$task, $query]), [
                'body' => 'Answering now.',
            ]);

        $this->assertDatabaseHas('task_queries', [
            'id' => $query->id,
            'status' => 'answered',
        ]);
    }

    public function test_raiser_can_close_query(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);
        $query = TaskQuery::create([
            'task_id' => $task->id,
            'raised_by' => $this->employeeUser->id,
            'directed_to' => $this->admin->id,
            'subject' => 'Close test',
            'description' => 'Test',
            'priority' => 'normal',
            'status' => 'answered',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->patch(route('tasks.queries.close', [$task, $query]));

        $response->assertRedirect();
        $this->assertDatabaseHas('task_queries', ['id' => $query->id, 'status' => 'closed']);
    }

    public function test_raiser_can_reopen_query(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);
        $query = TaskQuery::create([
            'task_id' => $task->id,
            'raised_by' => $this->employeeUser->id,
            'directed_to' => $this->admin->id,
            'subject' => 'Reopen test',
            'description' => 'Test',
            'priority' => 'normal',
            'status' => 'closed',
        ]);

        $response = $this->actingAs($this->employeeUser)
            ->patch(route('tasks.queries.reopen', [$task, $query]));

        $response->assertRedirect();
        $this->assertDatabaseHas('task_queries', ['id' => $query->id, 'status' => 'open']);
    }

    public function test_response_with_attachment(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);
        $query = TaskQuery::create([
            'task_id' => $task->id,
            'raised_by' => $this->employeeUser->id,
            'directed_to' => $this->admin->id,
            'subject' => 'With file',
            'description' => 'Attach test',
            'priority' => 'normal',
            'status' => 'open',
        ]);

        $file = UploadedFile::fake()->create('doc.pdf', 500);

        $response = $this->actingAs($this->admin)
            ->post(route('tasks.queries.respond', [$task, $query]), [
                'body' => 'See attached.',
                'attachment' => $file,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_query_responses', [
            'query_id' => $query->id,
            'body' => 'See attached.',
        ]);
    }

    public function test_non_participant_cannot_raise_query(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);
        $outsider = User::factory()->create();
        $outsider->assignRole('employee');

        $response = $this->actingAs($outsider)
            ->post(route('tasks.queries.store', $task), [
                'subject' => 'Should fail',
                'description' => 'No access',
                'priority' => 'normal',
                'directed_to' => $this->admin->id,
            ]);

        $response->assertForbidden();
    }
}
