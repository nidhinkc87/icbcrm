<?php

namespace App\Notifications\Task;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskCompleted extends Notification implements ShouldQueue
{
    use Queueable;
    use \App\Notifications\Concerns\BroadcastsToUser;

    public function __construct(
        protected Task $task,
        protected ?Task $followUpTask = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = config('app.name');
        $serviceName = $this->task->service?->name ?? 'N/A';
        $customerName = $this->task->customer?->user?->name ?? 'N/A';
        $completedBy = auth()->user()?->name ?? 'System';
        $url = route('tasks.show', $this->task->id);

        $message = (new MailMessage)
            ->subject("Task Completed — {$serviceName} (#{$this->task->id})")
            ->greeting("Hello {$notifiable->name},")
            ->line("Task **#{$this->task->id}** has been completed by **{$completedBy}**.")
            ->line('')
            ->line("**Task Details:**")
            ->line("- **Task ID:** #{$this->task->id}")
            ->line("- **Service:** {$serviceName}")
            ->line("- **Customer:** {$customerName}")
            ->line("- **Priority:** " . ucfirst($this->task->priority))
            ->line("- **Due Date:** " . $this->task->due_date->format('M d, Y'))
            ->line("- **Completed On:** " . now()->format('M d, Y'));

        if ($this->followUpTask) {
            $followUpUrl = route('tasks.show', $this->followUpTask->id);
            $message
                ->line('')
                ->line("**Follow-up Task Created:**")
                ->line("A follow-up task **#{$this->followUpTask->id}** has been scheduled with a due date of **" . $this->followUpTask->due_date->format('M d, Y') . "**.")
                ->action('View Follow-up Task', $followUpUrl);
        } else {
            $message->action('View Completed Task', $url);
        }

        return $message->salutation("Regards,\n{$appName}");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'task_completed',
            'title' => 'Task Completed',
            'message' => "Task #{$this->task->id} ({$this->task->service?->name}) completed by " . (auth()->user()?->name ?? 'System'),
            'url' => route('tasks.show', $this->task->id),
            'task_id' => $this->task->id,
        ];
    }
}
