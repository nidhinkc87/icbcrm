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
            'view clients',
            'create clients',
            'edit clients',
            'delete clients',
            'manage settings',
            'view dashboard',
            'view own profile',
            'edit own profile',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions(Permission::all());

        $employeeRole = Role::firstOrCreate(['name' => 'employee']);
        $employeeRole->syncPermissions([
            'view clients',
            'create clients',
            'edit clients',
            'delete clients',
            'view dashboard',
            'view own profile',
            'edit own profile',
        ]);

        $clientRole = Role::firstOrCreate(['name' => 'client']);
        $clientRole->syncPermissions([
            'view dashboard',
            'view own profile',
            'edit own profile',
        ]);
    }
}
