<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('phone', 20)->nullable();
            $table->string('company')->nullable();
            $table->timestamps();
        });

        Schema::create('partner_customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained('partner_profiles')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['partner_id', 'customer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_customers');
        Schema::dropIfExists('partner_profiles');
    }
};
