<?php

namespace App\Notifications\Task;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskCreated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Task $task,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = config('app.name');
        $serviceName = $this->task->service?->name ?? 'N/A';
        $customerName = $this->task->customer?->user?->name ?? 'N/A';
        $creatorName = $this->task->creator?->name ?? 'System';
        $priority = ucfirst($this->task->priority);
        $dueDate = $this->task->due_date->format('M d, Y');
        $url = route('tasks.show', $this->task->id);

        $isResponsible = $notifiable->id === $this->task->responsible_id;

        $message = (new MailMessage)
            ->subject("New Task Assigned — {$serviceName} (#{$this->task->id})")
            ->greeting("Hello {$notifiable->name},");

        if ($isResponsible) {
            $message->line("A new task has been assigned to you by **{$creatorName}**.");
        } else {
            $responsibleName = $this->task->responsible?->name ?? 'N/A';
            $message->line("A new task has been created by **{$creatorName}** and assigned to **{$responsibleName}**. You have been added as a participant.");
        }

        return $message
            ->line('')
            ->line("**Task Details:**")
            ->line("- **Task ID:** #{$this->task->id}")
            ->line("- **Service:** {$serviceName}")
            ->line("- **Customer:** {$customerName}")
            ->line("- **Priority:** {$priority}")
            ->line("- **Due Date:** {$dueDate}")
            ->when($this->task->instructions, fn ($m) => $m->line("- **Instructions:** " . \Illuminate\Support\Str::limit($this->task->instructions, 150)))
            ->action('View Task', $url)
            ->line("Please review the task details and begin work as needed.")
            ->salutation("Regards,\n{$appName}");
    }
}
