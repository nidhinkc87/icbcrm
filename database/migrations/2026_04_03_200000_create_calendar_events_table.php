<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['onsite', 'meeting', 'other'])->default('meeting');
            $table->string('location')->nullable();
            $table->date('date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->boolean('all_day')->default(false);
            $table->timestamps();
        });

        Schema::create('calendar_event_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['calendar_event_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_event_participants');
        Schema::dropIfExists('calendar_events');
    }
};
