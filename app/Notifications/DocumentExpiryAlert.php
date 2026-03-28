<?php

namespace App\Notifications;

use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\ExpiryActionRule;
use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentExpiryAlert extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Customer $customer,
        protected CustomerDocument $document,
        protected ExpiryActionRule $rule,
        protected string $daysLabel,
        protected ?Task $task = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = config('app.name');
        $customerName = $this->customer->user?->name ?? 'Unknown';
        $docTypeName = $this->document->documentType?->name ?? 'Document';
        $expiryDate = $this->document->expiry_date->format('M d, Y');
        $isOverdue = $this->document->expiry_date->isPast();

        $context = '';
        if ($this->document->partner) {
            $context = " (Partner: {$this->document->partner->name})";
        } elseif ($this->document->branch) {
            $context = " (Branch: {$this->document->branch->name})";
        }

        $message = (new MailMessage)
            ->greeting("Hello {$notifiable->name},");

        if ($isOverdue) {
            $message
                ->subject("Expired: {$docTypeName} — {$customerName}")
                ->error()
                ->line("The **{$docTypeName}**{$context} for customer **{$customerName}** has expired on **{$expiryDate}** ({$this->daysLabel}).");
        } else {
            $message
                ->subject("Expiry Alert: {$docTypeName} — {$customerName} ({$this->daysLabel})")
                ->line("The **{$docTypeName}**{$context} for customer **{$customerName}** will expire on **{$expiryDate}** ({$this->daysLabel}).");
        }

        $message
            ->line('')
            ->line("**Document Details:**")
            ->line("- **Customer:** {$customerName}")
            ->line("- **Document Type:** {$docTypeName}")
            ->line("- **Expiry Date:** {$expiryDate}");

        if ($this->document->value) {
            $message->line("- **Reference:** {$this->document->value}");
        }

        if ($this->task) {
            $message
                ->line('')
                ->line("A renewal task **#{$this->task->id}** has been automatically created and assigned.")
                ->action('View Task', route('tasks.show', $this->task->id));
        } else {
            $message->line('')
                ->line('Please take the necessary action to renew this document.');
        }

        return $message->salutation("Regards,\n{$appName}");
    }

    public function toArray(object $notifiable): array
    {
        $customerName = $this->customer->user?->name ?? 'Unknown';
        $docTypeName = $this->document->documentType?->name ?? 'Document';
        $isExpired = $this->document->expiry_date->isPast();

        return [
            'type' => 'document_expiry',
            'title' => $isExpired ? "{$docTypeName} Expired" : "{$docTypeName} Expiring Soon",
            'message' => "{$docTypeName} for {$customerName} — {$this->daysLabel}",
            'url' => $this->task ? route('tasks.show', $this->task->id) : route('admin.users.show', $this->customer->user_id),
            'is_urgent' => $isExpired,
        ];
    }
}
