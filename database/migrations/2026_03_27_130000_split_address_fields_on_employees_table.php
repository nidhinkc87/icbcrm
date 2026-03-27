<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Local address (UAE) — split into structured fields
            $table->string('local_address_line')->nullable()->after('local_address');
            $table->string('local_city')->nullable()->after('local_address_line');
            $table->string('local_emirate')->nullable()->after('local_city');
            $table->string('local_po_box')->nullable()->after('local_emirate');

            // Home country address — split into structured fields
            $table->string('home_address_line')->nullable()->after('home_country_address');
            $table->string('home_city')->nullable()->after('home_address_line');
            $table->string('home_state')->nullable()->after('home_city');
            $table->string('home_country')->nullable()->after('home_state');
            $table->string('home_postal_code')->nullable()->after('home_country');
            $table->string('home_contact_number')->nullable()->after('home_postal_code');

            // Drop old text fields
            $table->dropColumn(['local_address', 'home_country_address']);
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->text('local_address')->nullable()->after('emergency_contact_relationship');
            $table->text('home_country_address')->nullable()->after('local_address');

            $table->dropColumn([
                'local_address_line', 'local_city', 'local_emirate', 'local_po_box',
                'home_address_line', 'home_city', 'home_state', 'home_country', 'home_postal_code', 'home_contact_number',
            ]);
        });
    }
};
