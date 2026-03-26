<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Task email reminders — runs daily at 8:00 AM
Schedule::command('tasks:send-due-reminders')->dailyAt('08:00');

// Task overdue alerts — runs daily at 9:00 AM
Schedule::command('tasks:send-overdue-alerts')->dailyAt('09:00');
