<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification
{
    use Queueable;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function via($notifiable)
    {
        return ['database']; // pour les stocker en base
    }

    public function toArray($notifiable)
    {
        return [
            'sender_id' => $this->message->sender_id,
            'message_id' => $this->message->id,
            'content' => $this->message->content,
            'sender_name' => $this->message->sender->name,
        ];
    }
}

