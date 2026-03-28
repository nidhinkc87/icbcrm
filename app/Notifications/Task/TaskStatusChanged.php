<?php

namespace App\Notifications\Task;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;
    use \App\Notifications\Concerns\BroadcastsToUser;

    public function __construct(
        protected Task $task,
        protected string $oldStatus,
        protected string $newStatus,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = config('app.name');
        $serviceName = $this->task->service?->name ?? 'N/A';
        $updatedBy = auth()->user()?->name ?? 'System';
        $url = route('tasks.show', $this->task->id);

        $oldLabel = ucfirst(str_replace('_', ' ', $this->oldStatus));
        $newLabel = ucfirst(str_replace('_', ' ', $this->newStatus));

        return (new MailMessage)
            ->subject("Task Status Updated — {$serviceName} (#{$this->task->id})")
            ->greeting("Hello {$notifiable->name},")
            ->line("The status of Task **#{$this->task->id}** has been updated by **{$updatedBy}**.")
            ->line('')
            ->line("**Status Change:** {$oldLabel} → {$newLabel}")
            ->line('')
            ->line("**Task Details:**")
            ->line("- **Task ID:** #{$this->task->id}")
            ->line("- **Service:** {$serviceName}")
            ->line("- **Customer:** " . ($this->task->customer?->user?->name ?? 'N/A'))
            ->line("- **Responsible:** " . ($this->task->responsible?->name ?? 'N/A'))
            ->line("- **Due Date:** " . $this->task->due_date->format('M d, Y'))
            ->action('View Task', $url)
            ->salutation("Regards,\n{$appName}");
    }

    public function toArray(object $notifiable): array
    {
        $newLabel = ucfirst(str_replace('_', ' ', $this->newStatus));
        return [
            'type' => 'task_status_changed',
            'title' => "Task Status: {$newLabel}",
            'message' => "Task #{$this->task->id} ({$this->task->service?->name}) status changed to {$newLabel}",
            'url' => route('tasks.show', $this->task->id),
            'task_id' => $this->task->id,
        ];
    }
}
