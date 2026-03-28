<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop old customer_documents and recreate with new structure
        Schema::dropIfExists('customer_documents');

        Schema::create('customer_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_type_id')->constrained()->cascadeOnDelete();
            $table->foreignId('partner_id')->nullable()->constrained('customer_partners')->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('customer_branches')->cascadeOnDelete();
            $table->text('value')->nullable();
            $table->string('file_path')->nullable();
            $table->string('original_name')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_documents');

        Schema::create('customer_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('label')->nullable();
            $table->string('file_path');
            $table->string('original_name');
            $table->timestamps();
        });
    }
};
