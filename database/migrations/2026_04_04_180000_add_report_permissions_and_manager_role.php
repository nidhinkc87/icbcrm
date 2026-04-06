<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create report permissions
        $reportPermissions = [
            'view customer reports',
            'view partner reports',
            'view employee reports',
        ];

        foreach ($reportPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Grant all report permissions to admin
        $adminRole = Role::findByName('admin');
        $adminRole->givePermissionTo($reportPermissions);

        // Create manager role with appropriate permissions
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
        ]);
    }

    public function down(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        Role::findByName('manager')?->delete();

        foreach (['view customer reports', 'view partner reports', 'view employee reports'] as $name) {
            Permission::findByName($name)?->delete();
        }
    }
};
