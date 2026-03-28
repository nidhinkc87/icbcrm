<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('expiry_action_rules', 'service_ids')) {
            Schema::table('expiry_action_rules', function (Blueprint $table) {
                $table->json('service_ids')->nullable()->after('action');
            });
        }

        if (Schema::hasColumn('expiry_action_rules', 'service_id')) {
            DB::table('expiry_action_rules')->whereNotNull('service_id')->whereNull('service_ids')->orderBy('id')->each(function ($rule) {
                DB::table('expiry_action_rules')
                    ->where('id', $rule->id)
                    ->update(['service_ids' => json_encode([$rule->service_id])]);
            });

            Schema::table('expiry_action_rules', function (Blueprint $table) {
                $table->dropForeign(['service_id']);
                $table->dropColumn('service_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('expiry_action_rules', function (Blueprint $table) {
            $table->foreignId('service_id')->nullable()->after('action')->constrained()->nullOnDelete();
        });

        DB::table('expiry_action_rules')->whereNotNull('service_ids')->orderBy('id')->each(function ($rule) {
            $ids = json_decode($rule->service_ids, true);
            if (! empty($ids)) {
                DB::table('expiry_action_rules')
                    ->where('id', $rule->id)
                    ->update(['service_id' => $ids[0]]);
            }
        });

        Schema::table('expiry_action_rules', function (Blueprint $table) {
            $table->dropColumn('service_ids');
        });
    }
};
