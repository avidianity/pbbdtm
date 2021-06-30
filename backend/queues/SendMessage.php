<?php

namespace Queues;

use Interfaces\Queue\Queueable;
use Throwable;

class SendMessage implements Queueable
{
    public $to;
    public $message;

    public function __construct($to, $message)
    {
        $this->to = $to;
        $this->message = $message;
    }

    public function run()
    {
        message()->setTo($this->to)
            ->send($this->message);
    }

    public function __serialize(): array
    {
        return [
            'to' => $this->to,
            'message' => $this->message,
        ];
    }

    public function __unserialize(array $data): void
    {
        $this->to = $data['to'];
        $this->message = $data['message'];
    }

    public function report(Throwable $exception): void
    {
        throw $exception;
    }
}
