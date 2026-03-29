<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase, CreatesTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
        $this->createAdmin();
    }

    // ── Roles ──

    public function test_admin_can_view_roles(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.roles.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_role(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.roles.store'), [
            'name' => 'manager',
            'permissions' => ['view tasks', 'view dashboard'],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('roles', ['name' => 'manager']);
        $role = Role::findByName('manager');
        $this->assertTrue($role->hasPermissionTo('view tasks'));
    }

    public function test_admin_can_update_role(): void
    {
        $role = Role::create(['name' => 'tester']);

        $response = $this->actingAs($this->admin)->put(route('admin.roles.update', $role), [
            'name' => 'qa_tester',
            'permissions' => ['view tasks'],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('roles', ['name' => 'qa_tester']);
    }

    public function test_admin_can_delete_role(): void
    {
        $role = Role::create(['name' => 'temporary']);

        $response = $this->actingAs($this->admin)->delete(route('admin.roles.destroy', $role));

        $response->assertRedirect();
        $this->assertDatabaseMissing('roles', ['name' => 'temporary']);
    }

    // ── Permissions ──

    public function test_admin_can_view_permissions(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.permissions.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_permission(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.permissions.store'), [
            'name' => 'export reports',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('permissions', ['name' => 'export reports']);
    }

    // ── Access Control ──

    public function test_employee_cannot_access_admin_routes(): void
    {
        $employee = $this->createEmployee();

        $this->actingAs($employee)->get(route('admin.roles.index'))->assertForbidden();
        $this->actingAs($employee)->get(route('admin.permissions.index'))->assertForbidden();
        $this->actingAs($employee)->get(route('admin.services.index'))->assertForbidden();
    }

    public function test_customer_cannot_access_admin_routes(): void
    {
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        $this->actingAs($customer)->get(route('admin.roles.index'))->assertForbidden();
        $this->actingAs($customer)->get(route('admin.users.index'))->assertForbidden();
    }
}
