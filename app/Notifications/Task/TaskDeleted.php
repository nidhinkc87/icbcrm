<?php

namespace App\Notifications\Task;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskDeleted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected int $taskId,
        protected string $serviceName,
        protected string $clientName,
        protected string $deletedBy,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = config('app.name');

        return (new MailMessage)
            ->subject("Task Deleted — {$this->serviceName} (#{$this->taskId})")
            ->greeting("Hello {$notifiable->name},")
            ->line("Task **#{$this->taskId}** has been deleted by **{$this->deletedBy}**.")
            ->line('')
            ->line("**Deleted Task Details:**")
            ->line("- **Task ID:** #{$this->taskId}")
            ->line("- **Service:** {$this->serviceName}")
            ->line("- **Client:** {$this->clientName}")
            ->line('')
            ->line("This task and its associated data are no longer available. If you believe this was done in error, please contact your administrator.")
            ->action('Go to Tasks', route('tasks.index'))
            ->salutation("Regards,\n{$appName}");
    }
}
