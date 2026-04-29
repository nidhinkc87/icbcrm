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
            'request services',
            'upload own documents',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        Role::findByName('admin')?->givePermissionTo($permissions);
        Role::findByName('customer')?->givePermissionTo($permissions);
    }

    public function down(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (['request services', 'upload own documents'] as $name) {
            Permission::findByName($name)?->delete();
        }
    }
};
