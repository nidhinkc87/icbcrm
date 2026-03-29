<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class DashboardTest extends TestCase
{
    use RefreshDatabase, CreatesTestData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedRolesAndPermissions();
    }

    public function test_admin_can_access_dashboard(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertOk();
    }

    /** @group requires-mysql */
    public function test_employee_can_access_dashboard(): void
    {
        // Dashboard uses MySQL DATEDIFF which is unavailable in SQLite
        if (config('database.default') === 'sqlite') {
            $this->markTestSkipped('Requires MySQL (uses DATEDIFF).');
        }

        $employee = $this->createEmployee();

        $response = $this->actingAs($employee)->get(route('dashboard'));

        $response->assertOk();
    }

    public function test_customer_can_access_dashboard(): void
    {
        $customer = $this->createCustomerUser();

        $response = $this->actingAs($customer)->get(route('dashboard'));

        $response->assertOk();
    }

    public function test_unauthenticated_user_redirected_to_login(): void
    {
        $response = $this->get(route('dashboard'));

        $response->assertRedirect(route('login'));
    }
}
