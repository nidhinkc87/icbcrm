<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partner_profiles', function (Blueprint $table) {
            // Company / KYC
            $table->string('legal_type')->nullable()->after('company');
            $table->string('trade_license_no')->nullable()->after('legal_type');
            $table->string('issuing_authority')->nullable()->after('trade_license_no');
            $table->string('trade_license_file')->nullable()->after('issuing_authority');
            $table->date('trade_license_issue_date')->nullable()->after('trade_license_file');
            $table->date('trade_license_expiry_date')->nullable()->after('trade_license_issue_date');
            $table->string('moa_file')->nullable()->after('trade_license_expiry_date');
            $table->date('moa_issue_date')->nullable()->after('moa_file');
            // Bank
            $table->string('bank_name')->nullable()->after('moa_issue_date');
            $table->string('bank_branch')->nullable()->after('bank_name');
            $table->string('account_number')->nullable()->after('bank_branch');
            $table->string('iban')->nullable()->after('account_number');
            // Address
            $table->string('address_line')->nullable()->after('iban');
            $table->string('city')->nullable()->after('address_line');
            $table->string('emirate')->nullable()->after('city');
            $table->string('country')->default('UAE')->after('emirate');
            $table->string('po_box', 50)->nullable()->after('country');
            // Contact
            $table->string('contact_person_name')->nullable()->after('po_box');
            $table->string('telephone', 20)->nullable()->after('contact_person_name');
        });
    }

    public function down(): void
    {
        Schema::table('partner_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'legal_type', 'trade_license_no', 'issuing_authority',
                'trade_license_file', 'trade_license_issue_date', 'trade_license_expiry_date',
                'moa_file', 'moa_issue_date',
                'bank_name', 'bank_branch', 'account_number', 'iban',
                'address_line', 'city', 'emirate', 'country', 'po_box',
                'contact_person_name', 'telephone',
            ]);
        });
    }
};
