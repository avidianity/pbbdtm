<?php

namespace Queues;

use Interfaces\Queue\Queueable;
use Throwable;

class SendMailRaw implements Queueable
{
    public $to;
    public $subject;
    public $data;

    public function __construct($to, $subject, $data)
    {
        $this->to = $to;
        $this->subject = $subject;
        $this->data = $data;
    }

    public function run()
    {
        mailer()->setSubject($this->subject)
            ->setTo($this->to)
            ->send($this->data);
    }

    public function __serialize(): array
    {
        return [
            'to' => $this->to,
            'subject' => $this->subject,
            'data' => $this->data,
        ];
    }

    public function __unserialize(array $data): void
    {
        $this->to = $data['to'];
        $this->subject = $data['subject'];
        $this->data = $data['data'];
    }

    public function report(Throwable $exception): void
    {
        //
    }
}
