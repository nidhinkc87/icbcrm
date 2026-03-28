<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expiry_action_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rule_id')->constrained('expiry_action_rules')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_document_id')->constrained('customer_documents')->cascadeOnDelete();
            $table->date('expiry_date');
            $table->enum('action_taken', ['notified', 'task_created']);
            $table->foreignId('task_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            // Prevent duplicate actions for same rule + document + expiry
            $table->unique(['rule_id', 'customer_document_id', 'expiry_date'], 'unique_expiry_action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expiry_action_logs');
    }
};
