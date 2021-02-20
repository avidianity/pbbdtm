<?php

namespace Queues;

use Interfaces\Queue\Queueable;
use Throwable;

class SendMail implements Queueable
{
    public $to;
    public $view;
    public $subject;
    public $data;

    public function __construct($to, $view, $subject, $data)
    {
        $this->to = $to;
        $this->view = $view;
        $this->subject = $subject;
        $this->data = $data;
    }

    public function run()
    {
        mailer()->setSubject($this->subject)
            ->setTo($this->email)
            ->view($this->view, $this->Data)
            ->send();
    }

    public function __serialize(): array
    {
        return [
            'to' => $this->to,
            'view' => $this->view,
            'subject' => $this->subject,
            'data' => json_encode($this->data),
        ];
    }

    public function __unserialize(array $data): void
    {
        $this->to = $data['to'];
        $this->view = $data['view'];
        $this->subject = $data['subject'];
        $this->data = (array)json_decode($data['data']);
    }

    public function report(Throwable $exception): void
    {
        //
    }
}
