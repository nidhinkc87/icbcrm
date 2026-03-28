<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@icbcrm.com',
        ]);
        $admin->assignRole('admin');

        $employee = User::factory()->create([
            'name' => 'Test Employee',
            'email' => 'employee@icbcrm.com',
        ]);
        $employee->assignRole('employee');

        $customer = User::factory()->create([
            'name' => 'Test Client',
            'email' => 'client@icbcrm.com',
        ]);
        $customer->assignRole('customer');

        $this->call(SampleDataSeeder::class);
    }
}
