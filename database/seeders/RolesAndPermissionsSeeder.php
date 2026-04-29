<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view users',
            'create users',
            'edit users',
            'delete users',
            'view employees',
            'create employees',
            'edit employees',
            'delete employees',
            'view customers',
            'create customers',
            'edit customers',
            'delete customers',
            'manage settings',
            'assign tasks',
            'view tasks',
            'view dashboard',
            'view own profile',
            'edit own profile',
            'view customer reports',
            'view partner reports',
            'view employee reports',
            'view service reports',
            'view own customer report',
            'view own meetings report',
            'view own pending tasks report',
            'request services',
            'upload own documents',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions(Permission::all());

        $managerRole = Role::firstOrCreate(['name' => 'manager']);
        $managerRole->syncPermissions([
            'view customers',
            'create customers',
            'edit customers',
            'delete customers',
            'view employees',
            'view tasks',
            'assign tasks',
            'view dashboard',
            'view own profile',
            'edit own profile',
            'view customer reports',
            'view partner reports',
            'view employee reports',
            'view service reports',
            'view own customer report',
            'view own meetings report',
            'view own pending tasks report',
        ]);

        $employeeRole = Role::firstOrCreate(['name' => 'employee']);
        $employeeRole->syncPermissions([
            'view customers',
            'create customers',
            'edit customers',
            'delete customers',
            'view tasks',
            'view dashboard',
            'view own profile',
            'edit own profile',
            'view own customer report',
            'view own meetings report',
            'view own pending tasks report',
        ]);

        $customerRole = Role::firstOrCreate(['name' => 'customer']);
        $customerRole->syncPermissions([
            'view tasks',
            'view dashboard',
            'view own profile',
            'edit own profile',
            'request services',
            'upload own documents',
        ]);

        $partnerRole = Role::firstOrCreate(['name' => 'partner']);
        $partnerRole->syncPermissions([
            'view tasks',
            'view dashboard',
            'view own profile',
            'edit own profile',
        ]);
    }
}
