<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class UserManagementTest extends TestCase
{
    use RefreshDatabase, CreatesTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
        $this->createAdmin();
        Storage::fake('public');
    }

    public function test_admin_can_view_users_list(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.users.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_employee_user(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.users.store'), [
            'name' => 'New Employee',
            'email' => 'emp@test.com',
            'type' => 'employee',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'emp@test.com']);
        $user = User::where('email', 'emp@test.com')->first();
        $this->assertTrue($user->hasRole('employee'));
        $this->assertDatabaseHas('employees', ['user_id' => $user->id]);
    }

    public function test_admin_can_view_user_detail(): void
    {
        $user = User::factory()->create();
        $user->assignRole('employee');
        Employee::create(['user_id' => $user->id]);

        $response = $this->actingAs($this->admin)->get(route('admin.users.show', $user));
        $response->assertOk();
    }

    public function test_admin_can_delete_user(): void
    {
        $user = User::factory()->create();
        $user->assignRole('employee');

        $response = $this->actingAs($this->admin)->delete(route('admin.users.destroy', $user));

        $response->assertRedirect();
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_employee_cannot_manage_users(): void
    {
        $employee = User::factory()->create();
        $employee->assignRole('employee');

        $response = $this->actingAs($employee)->get(route('admin.users.index'));
        $response->assertForbidden();
    }

    public function test_customer_cannot_manage_users(): void
    {
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        $response = $this->actingAs($customer)->get(route('admin.users.index'));
        $response->assertForbidden();
    }

    public function test_duplicate_email_rejected(): void
    {
        User::factory()->create(['email' => 'taken@test.com']);

        $response = $this->actingAs($this->admin)->post(route('admin.users.store'), [
            'name' => 'Duplicate',
            'email' => 'taken@test.com',
            'type' => 'employee',
        ]);

        $response->assertSessionHasErrors('email');
    }
}
