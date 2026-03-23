<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserInvitation extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected string $token,
        protected string $role,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        $roleLabel = ucfirst($this->role);

        return (new MailMessage)
            ->subject('You\'re Invited — Set Up Your Account')
            ->greeting("Hello {$notifiable->name},")
            ->line("You have been added as a **{$roleLabel}** on " . config('app.name') . '.')
            ->line('Please click the button below to set your password and activate your account.')
            ->action('Set Your Password', $url)
            ->line('This link will expire in 60 minutes.')
            ->line('If you did not expect this invitation, no further action is required.');
    }
}
