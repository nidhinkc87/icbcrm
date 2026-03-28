<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        $password = Hash::make('password');

        $admin = User::updateOrCreate(
            ['email' => 'admin@icbcrm.com'],
            ['name' => 'Admin', 'password' => $password, 'email_verified_at' => now(), 'remember_token' => Str::random(10)]
        );
        $admin->assignRole('admin');

        $employee = User::updateOrCreate(
            ['email' => 'employee@icbcrm.com'],
            ['name' => 'Test Employee', 'password' => $password, 'email_verified_at' => now(), 'remember_token' => Str::random(10)]
        );
        $employee->assignRole('employee');

        $customer = User::updateOrCreate(
            ['email' => 'client@icbcrm.com'],
            ['name' => 'Test Client', 'password' => $password, 'email_verified_at' => now(), 'remember_token' => Str::random(10)]
        );
        $customer->assignRole('customer');

        $this->call(SampleDataSeeder::class);
        $this->call(DocumentTypeSeeder::class);
        $this->call(ExpiryActionRuleSeeder::class);
    }
}
