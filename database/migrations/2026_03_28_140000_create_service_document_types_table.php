<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_document_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_type_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_required')->default(true);
            $table->timestamps();

            $table->unique(['service_id', 'document_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_document_types');
    }
};
