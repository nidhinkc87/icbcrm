<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use App\Notifications\Task\TaskCompleted;
use App\Notifications\Task\TaskCreated;
use App\Notifications\Task\TaskDeleted;
use App\Notifications\Task\TaskReassigned;
use App\Notifications\Task\TaskStatusChanged;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class TaskLifecycleTest extends TestCase
{
    use RefreshDatabase, CreatesTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setupBaseData();
        Storage::fake('public');
    }

    // ── Creation ──

    public function test_admin_can_create_task(): void
    {
        Notification::fake();

        $response = $this->actingAs($this->admin)->post(route('tasks.store'), [
            'service_id' => $this->service->id,
            'customer_id' => $this->customer->id,
            'responsible_id' => $this->employeeUser->id,
            'priority' => 'high',
            'due_date' => now()->addDays(5)->toDateString(),
            'instructions' => 'Handle this urgently',
            'collaborator_ids' => [],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', [
            'service_id' => $this->service->id,
            'customer_id' => $this->customer->id,
            'responsible_id' => $this->employeeUser->id,
            'priority' => 'high',
            'status' => 'pending',
        ]);

        Notification::assertSentTo($this->employeeUser, TaskCreated::class);
    }

    public function test_task_created_with_collaborators(): void
    {
        Notification::fake();
        $collab = User::factory()->create();
        $collab->assignRole('employee');

        $this->actingAs($this->admin)->post(route('tasks.store'), [
            'service_id' => $this->service->id,
            'customer_id' => $this->customer->id,
            'responsible_id' => $this->employeeUser->id,
            'priority' => 'medium',
            'due_date' => now()->addDays(5)->toDateString(),
            'collaborator_ids' => [$collab->id],
        ]);

        $task = Task::latest()->first();
        $this->assertTrue($task->collaborators->contains($collab));
    }

    public function test_task_created_with_attachments(): void
    {
        Notification::fake();

        $file = UploadedFile::fake()->create('document.pdf', 500, 'application/pdf');

        $this->actingAs($this->admin)->post(route('tasks.store'), [
            'service_id' => $this->service->id,
            'customer_id' => $this->customer->id,
            'responsible_id' => $this->employeeUser->id,
            'priority' => 'medium',
            'due_date' => now()->addDays(5)->toDateString(),
            'attachments' => [$file],
            'collaborator_ids' => [],
        ]);

        $task = Task::latest()->first();
        $this->assertCount(1, $task->attachments);
    }

    public function test_customer_cannot_create_task(): void
    {
        $response = $this->actingAs($this->customerUser)->get(route('tasks.create'));
        $response->assertForbidden();
    }

    // ── Status Transitions ──

    public function test_task_status_pending_to_in_progress(): void
    {
        Notification::fake();
        $task = $this->createTask();

        $response = $this->actingAs($this->employeeUser)
            ->patch(route('tasks.update-status', $task), ['status' => 'in_progress']);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'status' => 'in_progress']);
    }

    public function test_task_status_in_progress_to_completed_via_status_update(): void
    {
        Notification::fake();
        $task = $this->createTask(['status' => 'in_progress']);

        $response = $this->actingAs($this->admin)
            ->patch(route('tasks.update-status', $task), ['status' => 'completed']);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'status' => 'completed']);
    }

    public function test_non_admin_cannot_move_status_backward(): void
    {
        Notification::fake();
        $task = $this->createTask(['status' => 'in_progress']);

        $response = $this->actingAs($this->employeeUser)
            ->patch(route('tasks.update-status', $task), ['status' => 'pending']);

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'status' => 'in_progress']);
    }

    public function test_admin_can_move_status_backward(): void
    {
        Notification::fake();
        $task = $this->createTask(['status' => 'in_progress']);

        $response = $this->actingAs($this->admin)
            ->patch(route('tasks.update-status', $task), ['status' => 'pending']);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'status' => 'pending']);
    }

    public function test_auto_transition_to_in_progress_on_complete_page(): void
    {
        Notification::fake();
        $task = $this->createTask(['status' => 'pending']);

        $this->actingAs($this->employeeUser)->get(route('tasks.complete', $task));

        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'status' => 'in_progress']);
    }

    // ── Update & Reassignment ──

    public function test_admin_can_update_task(): void
    {
        Notification::fake();
        $task = $this->createTask();

        $response = $this->actingAs($this->admin)->put(route('tasks.update', $task), [
            'service_id' => $this->service->id,
            'customer_id' => $this->customer->id,
            'responsible_id' => $this->employeeUser->id,
            'priority' => 'urgent',
            'due_date' => now()->addDays(3)->toDateString(),
            'instructions' => 'Updated instructions',
            'collaborator_ids' => [],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'priority' => 'urgent']);
    }

    public function test_reassignment_sends_notification(): void
    {
        Notification::fake();
        $task = $this->createTask();
        $newEmployee = User::factory()->create();
        $newEmployee->assignRole('employee');

        $this->actingAs($this->admin)->put(route('tasks.update', $task), [
            'service_id' => $this->service->id,
            'customer_id' => $this->customer->id,
            'responsible_id' => $newEmployee->id,
            'priority' => 'medium',
            'due_date' => now()->addDays(7)->toDateString(),
            'collaborator_ids' => [],
        ]);

        Notification::assertSentTo($newEmployee, TaskReassigned::class);
    }

    // ── Deletion ──

    public function test_admin_can_delete_task(): void
    {
        Notification::fake();
        $task = $this->createTask();

        $response = $this->actingAs($this->admin)->delete(route('tasks.destroy', $task));

        $response->assertRedirect();
        $this->assertSoftDeleted('tasks', ['id' => $task->id]);
    }

    public function test_employee_cannot_delete_other_users_task(): void
    {
        $task = $this->createTask(['created_by' => $this->admin->id]);

        $response = $this->actingAs($this->employeeUser)->delete(route('tasks.destroy', $task));

        $response->assertForbidden();
    }

    // ── Visibility ──

    public function test_admin_sees_all_tasks(): void
    {
        $this->createTask();

        $response = $this->actingAs($this->admin)->get(route('tasks.index'));

        $response->assertOk();
    }

    public function test_employee_sees_only_assigned_tasks(): void
    {
        $otherEmployee = User::factory()->create();
        $otherEmployee->assignRole('employee');

        $myTask = $this->createTask(['responsible_id' => $this->employeeUser->id]);
        $otherTask = $this->createTask(['responsible_id' => $otherEmployee->id]);

        $response = $this->actingAs($this->employeeUser)->get(route('tasks.index'));

        $response->assertOk();
    }

    // ── Collaborators ──

    public function test_add_collaborator_to_task(): void
    {
        Notification::fake();
        $task = $this->createTask();
        $collab = User::factory()->create();
        $collab->assignRole('employee');

        $response = $this->actingAs($this->employeeUser)
            ->post(route('tasks.collaborators.add', $task), [
                'user_id' => $collab->id,
                'can_work' => false,
            ]);

        $response->assertRedirect();
        $this->assertTrue($task->fresh()->collaborators->contains($collab));
    }

    public function test_remove_collaborator_from_task(): void
    {
        Notification::fake();
        $task = $this->createTask();
        $collab = User::factory()->create();
        $collab->assignRole('employee');
        $task->collaborators()->attach($collab->id, ['can_work' => false]);

        $response = $this->actingAs($this->employeeUser)
            ->delete(route('tasks.collaborators.remove', [$task, $collab]));

        $response->assertRedirect();
        $this->assertFalse($task->fresh()->collaborators->contains($collab));
    }

    public function test_toggle_collaborator_can_work(): void
    {
        Notification::fake();
        $task = $this->createTask();
        $collab = User::factory()->create();
        $collab->assignRole('employee');
        $task->collaborators()->attach($collab->id, ['can_work' => false]);

        $response = $this->actingAs($this->employeeUser)
            ->patch(route('tasks.collaborators.toggle-work', [$task, $collab]), [
                'can_work' => true,
            ]);

        $response->assertRedirect();
        $this->assertTrue((bool) $task->fresh()->collaborators->find($collab->id)->pivot->can_work);
    }

    public function test_collaborator_with_can_work_can_access_complete_page(): void
    {
        Notification::fake();
        $task = $this->createTask(['status' => 'in_progress']);
        $collab = User::factory()->create();
        $collab->assignRole('employee');
        $task->collaborators()->attach($collab->id, ['can_work' => true]);

        $response = $this->actingAs($collab)->get(route('tasks.complete', $task));
        $response->assertOk();
    }

    public function test_collaborator_without_can_work_cannot_access_complete_page(): void
    {
        $task = $this->createTask(['status' => 'in_progress']);
        $collab = User::factory()->create();
        $collab->assignRole('employee');
        $task->collaborators()->attach($collab->id, ['can_work' => false]);

        $response = $this->actingAs($collab)->get(route('tasks.complete', $task));
        $response->assertForbidden();
    }
}
