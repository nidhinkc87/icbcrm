<?php

namespace App\Notifications\Task;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskOverdueAlert extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Task $task,
        protected int $daysOverdue,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = config('app.name');
        $serviceName = $this->task->service?->name ?? 'N/A';
        $clientName = $this->task->client?->user?->name ?? 'N/A';
        $responsibleName = $this->task->responsible?->name ?? 'N/A';
        $dueDate = $this->task->due_date->format('M d, Y');
        $url = route('tasks.show', $this->task->id);

        $dayLabel = $this->daysOverdue === 1 ? '1 day' : "{$this->daysOverdue} days";

        $isResponsible = $notifiable->id === $this->task->responsible_id;

        $message = (new MailMessage)
            ->subject("Overdue: Task #{$this->task->id} — {$serviceName} ({$dayLabel} past due)")
            ->greeting("Hello {$notifiable->name},")
            ->error();

        if ($isResponsible) {
            $message->line("Task **#{$this->task->id}** assigned to you is now **{$dayLabel} overdue**. Please prioritize completing this task.");
        } else {
            $message->line("Task **#{$this->task->id}** assigned to **{$responsibleName}** is now **{$dayLabel} overdue**.");
        }

        return $message
            ->line('')
            ->line("**Task Details:**")
            ->line("- **Task ID:** #{$this->task->id}")
            ->line("- **Service:** {$serviceName}")
            ->line("- **Client:** {$clientName}")
            ->line("- **Responsible:** {$responsibleName}")
            ->line("- **Priority:** " . ucfirst($this->task->priority))
            ->line("- **Status:** " . ucfirst(str_replace('_', ' ', $this->task->status)))
            ->line("- **Due Date:** {$dueDate}")
            ->line("- **Days Overdue:** {$dayLabel}")
            ->action('View Task', $url)
            ->salutation("Regards,\n{$appName}");
    }
}
