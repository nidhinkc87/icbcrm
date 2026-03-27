<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            // Personal info
            $table->string('personal_email')->nullable()->after('phone');
            $table->string('contact_number')->nullable()->after('personal_email');
            $table->string('emergency_contact_name')->nullable()->after('contact_number');
            $table->string('emergency_contact_number')->nullable()->after('emergency_contact_name');
            $table->string('emergency_contact_relationship')->nullable()->after('emergency_contact_number');

            // Addresses
            $table->text('local_address')->nullable()->after('emergency_contact_relationship');
            $table->text('home_country_address')->nullable()->after('local_address');

            // Documents (file paths)
            $table->string('photo')->nullable()->after('home_country_address');
            $table->string('passport')->nullable()->after('photo');
            $table->string('emirates_id')->nullable()->after('passport');
            $table->string('visa')->nullable()->after('emirates_id');
            $table->string('driving_id')->nullable()->after('visa');
            $table->string('insurance')->nullable()->after('driving_id');
            $table->json('education_certificates')->nullable()->after('insurance');
            $table->string('offer_letter')->nullable()->after('education_certificates');
            $table->string('labour_contract')->nullable()->after('offer_letter');
            $table->string('nda')->nullable()->after('labour_contract');
            $table->string('handbook')->nullable()->after('nda');
            $table->json('personal_goal')->nullable()->after('handbook');
            $table->json('professional_goal')->nullable()->after('personal_goal');

            // Submission tracking
            $table->date('submission_date')->nullable()->after('professional_goal');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'personal_email', 'contact_number',
                'emergency_contact_name', 'emergency_contact_number', 'emergency_contact_relationship',
                'local_address', 'home_country_address',
                'photo', 'passport', 'emirates_id', 'visa', 'driving_id', 'insurance',
                'education_certificates', 'offer_letter', 'labour_contract', 'nda', 'handbook',
                'personal_goal', 'professional_goal', 'submission_date',
            ]);
        });
    }
};
