<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expiry_action_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('document_type_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('trigger_days_before')->default(30);
            $table->enum('action', ['notify_only', 'auto_create_task'])->default('notify_only');
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('assignment_strategy', ['last_employee', 'admin', 'specific_employee'])->default('last_employee');
            $table->foreignId('assigned_employee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('notify_customer')->default(true);
            $table->boolean('notify_admin')->default(true);
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expiry_action_rules');
    }
};
