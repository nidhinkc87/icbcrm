<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_document_types', function (Blueprint $table) {
            $table->string('phase', 20)->default('work')->after('document_type_id');
        });

        // Update existing records to 'work' phase
        DB::table('service_document_types')->update(['phase' => 'work']);

        // Drop old unique constraint and add new one with phase
        Schema::table('service_document_types', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->dropForeign(['document_type_id']);
            $table->dropUnique(['service_id', 'document_type_id']);
            $table->unique(['service_id', 'document_type_id', 'phase']);
            $table->foreign('service_id')->references('id')->on('services')->cascadeOnDelete();
            $table->foreign('document_type_id')->references('id')->on('document_types')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('service_document_types', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->dropForeign(['document_type_id']);
            $table->dropUnique(['service_id', 'document_type_id', 'phase']);
            $table->unique(['service_id', 'document_type_id']);
            $table->foreign('service_id')->references('id')->on('services')->cascadeOnDelete();
            $table->foreign('document_type_id')->references('id')->on('document_types')->cascadeOnDelete();
            $table->dropColumn('phase');
        });
    }
};
