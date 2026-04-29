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

        Permission::firstOrCreate(['name' => 'view own customer report']);

        Role::findByName('admin')?->givePermissionTo('view own customer report');
        Role::findByName('manager')?->givePermissionTo('view own customer report');
        Role::findByName('employee')?->givePermissionTo('view own customer report');
    }

    public function down(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        Permission::findByName('view own customer report')?->delete();
    }
};
