<?php

namespace Tests\Unit;

use App\Models\Customer;
use App\Models\Employee;
use App\Models\Service;
use App\Models\Task;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskModelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function createTaskWithRelations(): Task
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $employee = User::factory()->create();
        $employee->assignRole('employee');

        $customerUser = User::factory()->create();
        $customerUser->assignRole('customer');
        $customer = Customer::create(['user_id' => $customerUser->id]);

        $service = Service::create([
            'name' => 'Test', 'form_schema' => [], 'is_active' => true,
        ]);

        return Task::create([
            'created_by' => $admin->id,
            'service_id' => $service->id,
            'customer_id' => $customer->id,
            'responsible_id' => $employee->id,
            'priority' => 'medium',
            'status' => 'pending',
            'due_date' => now()->addWeek(),
        ]);
    }

    public function test_canUserWork_returns_true_for_responsible(): void
    {
        $task = $this->createTaskWithRelations();
        $responsible = User::find($task->responsible_id);

        $this->assertTrue($task->canUserWork($responsible));
    }

    public function test_canUserWork_returns_true_for_admin(): void
    {
        $task = $this->createTaskWithRelations();
        $admin = User::find($task->created_by);

        $this->assertTrue($task->canUserWork($admin));
    }

    public function test_canUserWork_returns_true_for_collaborator_with_can_work(): void
    {
        $task = $this->createTaskWithRelations();
        $collab = User::factory()->create();
        $collab->assignRole('employee');
        $task->collaborators()->attach($collab->id, ['can_work' => true]);

        $this->assertTrue($task->canUserWork($collab));
    }

    public function test_canUserWork_returns_false_for_collaborator_without_can_work(): void
    {
        $task = $this->createTaskWithRelations();
        $collab = User::factory()->create();
        $collab->assignRole('employee');
        $task->collaborators()->attach($collab->id, ['can_work' => false]);

        $this->assertFalse($task->canUserWork($collab));
    }

    public function test_canUserWork_returns_false_for_random_user(): void
    {
        $task = $this->createTaskWithRelations();
        $random = User::factory()->create();
        $random->assignRole('employee');

        $this->assertFalse($task->canUserWork($random));
    }

    public function test_followup_relationship(): void
    {
        $task = $this->createTaskWithRelations();
        $followUp = Task::create([
            'parent_task_id' => $task->id,
            'created_by' => $task->created_by,
            'service_id' => $task->service_id,
            'customer_id' => $task->customer_id,
            'responsible_id' => $task->responsible_id,
            'priority' => 'medium',
            'status' => 'pending',
            'due_date' => now()->addMonth(),
        ]);

        $this->assertEquals($task->id, $followUp->parentTask->id);
        $this->assertTrue($task->followUpTasks->contains($followUp));
    }

    public function test_task_soft_deletes(): void
    {
        $task = $this->createTaskWithRelations();
        $task->delete();

        $this->assertSoftDeleted('tasks', ['id' => $task->id]);
        $this->assertNotNull(Task::withTrashed()->find($task->id));
    }

    public function test_visible_to_scope_for_admin(): void
    {
        $task = $this->createTaskWithRelations();
        $admin = User::find($task->created_by);

        $visible = Task::visibleTo($admin)->get();
        $this->assertTrue($visible->contains($task));
    }

    public function test_visible_to_scope_excludes_unrelated_tasks(): void
    {
        $task = $this->createTaskWithRelations();
        $outsider = User::factory()->create();
        $outsider->assignRole('employee');
        Employee::create(['user_id' => $outsider->id]);

        $visible = Task::visibleTo($outsider)->get();
        $this->assertFalse($visible->contains($task));
    }
}
