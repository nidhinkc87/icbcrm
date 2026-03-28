<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Company details
            $table->string('legal_type')->nullable()->after('po_box');
            $table->string('trade_license_no')->nullable()->after('legal_type');
            $table->string('issuing_authority')->nullable()->after('trade_license_no');

            // Contact details
            $table->string('contact_person_name')->nullable()->after('issuing_authority');
            $table->string('telephone')->nullable()->after('contact_person_name');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['legal_type', 'trade_license_no', 'issuing_authority', 'contact_person_name', 'telephone']);
        });
    }
};
