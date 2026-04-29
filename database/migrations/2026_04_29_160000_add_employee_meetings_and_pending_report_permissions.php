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

        $permissions = [
            'view own meetings report',
            'view own pending tasks report',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        foreach (['admin', 'manager', 'employee'] as $roleName) {
            Role::findByName($roleName)?->givePermissionTo($permissions);
        }
    }

    public function down(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (['view own meetings report', 'view own pending tasks report'] as $name) {
            Permission::findByName($name)?->delete();
        }
    }
};
