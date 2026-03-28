<?php

namespace App\Notifications\Task;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskDueDateReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Task $task,
        protected int $daysRemaining,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = config('app.name');
        $serviceName = $this->task->service?->name ?? 'N/A';
        $customerName = $this->task->customer?->user?->name ?? 'N/A';
        $dueDate = $this->task->due_date->format('M d, Y');
        $url = route('tasks.show', $this->task->id);

        $urgency = $this->daysRemaining <= 1 ? 'tomorrow' : "in {$this->daysRemaining} days";

        return (new MailMessage)
            ->subject("Reminder: Task Due {$urgency} — {$serviceName} (#{$this->task->id})")
            ->greeting("Hello {$notifiable->name},")
            ->line("This is a reminder that Task **#{$this->task->id}** is due **{$urgency}**.")
            ->line('')
            ->line("**Task Details:**")
            ->line("- **Task ID:** #{$this->task->id}")
            ->line("- **Service:** {$serviceName}")
            ->line("- **Customer:** {$customerName}")
            ->line("- **Priority:** " . ucfirst($this->task->priority))
            ->line("- **Status:** " . ucfirst(str_replace('_', ' ', $this->task->status)))
            ->line("- **Due Date:** {$dueDate}")
            ->action('View Task', $url)
            ->line("Please ensure this task is completed before the due date.")
            ->salutation("Regards,\n{$appName}");
    }

    public function toArray(object $notifiable): array
    {
        $urgency = $this->daysRemaining <= 1 ? 'tomorrow' : "in {$this->daysRemaining} days";
        return [
            'type' => 'task_due_reminder',
            'title' => "Task Due {$urgency}",
            'message' => "Task #{$this->task->id} ({$this->task->service?->name}) is due {$urgency}",
            'url' => route('tasks.show', $this->task->id),
            'task_id' => $this->task->id,
        ];
    }
}
