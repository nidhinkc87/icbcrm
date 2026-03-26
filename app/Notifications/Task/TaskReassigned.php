<?php

namespace App\Notifications\Task;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskReassigned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Task $task,
        protected User $oldResponsible,
        protected User $newResponsible,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = config('app.name');
        $serviceName = $this->task->service?->name ?? 'N/A';
        $updatedBy = auth()->user()?->name ?? 'System';
        $url = route('tasks.show', $this->task->id);

        $isNewResponsible = $notifiable->id === $this->newResponsible->id;

        $message = (new MailMessage)
            ->greeting("Hello {$notifiable->name},");

        if ($isNewResponsible) {
            $message
                ->subject("Task Reassigned to You — {$serviceName} (#{$this->task->id})")
                ->line("Task **#{$this->task->id}** has been reassigned to you by **{$updatedBy}**.")
                ->line("This task was previously assigned to **{$this->oldResponsible->name}**.");
        } else {
            $message
                ->subject("Task Reassignment — {$serviceName} (#{$this->task->id})")
                ->line("Task **#{$this->task->id}** has been reassigned from you to **{$this->newResponsible->name}** by **{$updatedBy}**.")
                ->line("No further action is required from you on this task.");
        }

        return $message
            ->line('')
            ->line("**Task Details:**")
            ->line("- **Task ID:** #{$this->task->id}")
            ->line("- **Service:** {$serviceName}")
            ->line("- **Priority:** " . ucfirst($this->task->priority))
            ->line("- **Due Date:** " . $this->task->due_date->format('M d, Y'))
            ->action('View Task', $url)
            ->salutation("Regards,\n{$appName}");
    }
}
