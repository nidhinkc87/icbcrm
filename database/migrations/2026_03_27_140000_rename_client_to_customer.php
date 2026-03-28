<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop foreign keys before renaming
        Schema::table('client_documents', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
        });

        // Rename tables
        Schema::rename('clients', 'customers');
        Schema::rename('client_documents', 'customer_documents');

        // Rename columns
        Schema::table('customer_documents', function (Blueprint $table) {
            $table->renameColumn('client_id', 'customer_id');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->renameColumn('client_id', 'customer_id');
        });

        // Re-add foreign keys
        Schema::table('customer_documents', function (Blueprint $table) {
            $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete();
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('customer_documents', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
        });

        Schema::rename('customers', 'clients');
        Schema::rename('customer_documents', 'client_documents');

        Schema::table('client_documents', function (Blueprint $table) {
            $table->renameColumn('customer_id', 'client_id');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->renameColumn('customer_id', 'client_id');
        });

        Schema::table('client_documents', function (Blueprint $table) {
            $table->foreign('client_id')->references('id')->on('clients')->cascadeOnDelete();
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreign('client_id')->references('id')->on('clients')->nullOnDelete();
        });
    }
};
