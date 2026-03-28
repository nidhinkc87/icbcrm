<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Models\User;
use App\Notifications\Task\TaskOverdueAlert;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class SendTaskOverdueAlerts extends Command
{
    protected $signature = 'tasks:send-overdue-alerts';

    protected $description = 'Send email alerts for overdue tasks';

    public function handle(): int
    {
        $today = now()->startOfDay();

        $tasks = Task::where('status', '!=', 'completed')
            ->where('due_date', '<', $today)
            ->with(['service:id,name', 'customer.user:id,name', 'responsible:id,name,email', 'creator:id,name,email'])
            ->get();

        $admins = User::role('admin')->get();
        $count = 0;

        foreach ($tasks as $task) {
            $daysOverdue = (int) $task->due_date->diffInDays($today);

            $recipients = collect();

            if ($task->responsible) {
                $recipients->push($task->responsible);
            }

            if ($task->creator) {
                $recipients->push($task->creator);
            }

            $recipients = $recipients->merge($admins)->unique('id');

            if ($recipients->isNotEmpty()) {
                Notification::send($recipients, new TaskOverdueAlert($task, $daysOverdue));
                $count++;
            }
        }

        $this->info("Sent overdue alerts for {$count} tasks.");

        return Command::SUCCESS;
    }
}
