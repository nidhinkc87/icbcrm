<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Notifications\Task\TaskDueDateReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class SendTaskDueDateReminders extends Command
{
    protected $signature = 'tasks:send-due-reminders';

    protected $description = 'Send email reminders for tasks due within the next 3 days';

    public function handle(): int
    {
        $today = now()->startOfDay();

        $tasks = Task::where('status', '!=', 'completed')
            ->whereBetween('due_date', [$today, $today->copy()->addDays(3)])
            ->with(['service:id,name', 'client.user:id,name', 'responsible:id,name,email', 'collaborators:id,name,email'])
            ->get();

        $count = 0;

        foreach ($tasks as $task) {
            $daysRemaining = (int) $today->diffInDays($task->due_date, false);

            $recipients = collect();

            if ($task->responsible) {
                $recipients->push($task->responsible);
            }

            foreach ($task->collaborators as $collaborator) {
                if ($collaborator->pivot->can_work) {
                    $recipients->push($collaborator);
                }
            }

            $recipients = $recipients->unique('id');

            if ($recipients->isNotEmpty()) {
                Notification::send($recipients, new TaskDueDateReminder($task, $daysRemaining));
                $count++;
            }
        }

        $this->info("Sent due date reminders for {$count} tasks.");

        return Command::SUCCESS;
    }
}
