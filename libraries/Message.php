<?php

namespace Libraries;

use Exception;
use Interfaces\Singleton as SingletonContract;
use Traits\Singleton;
use Twilio\Rest\Client;

class Message implements SingletonContract
{
    use Singleton;

    protected $to = '';
    protected $from = 'PBBDTM';
    protected $message = '';

    protected $sid;
    protected $token;
    protected $service;

    /**
     * @var \Twilio\Rest\Client
     */
    protected $client = null;

    public function __construct()
    {
        $this->sid = config('sms.sid');
        $this->token = config('sms.token');
        $this->service = config('sms.service');
        $this->init();
    }

    protected function init()
    {
        $this->client = new Client($this->sid, $this->token);

        $this->reset();

        return $this;
    }

    protected function reset()
    {
        $this->to = '';
        $this->message = '';
        return $this;
    }

    public function setTo($to)
    {
        $this->to = $to;
        return $this;
    }

    public function getTo()
    {
        if (mb_substr($this->to, 0, 1, 'utf-8') !== '+') {
            return '+' . $this->to;
        }
        return $this->to;
    }

    public function setMessage($message)
    {
        $this->message = $message;
        return $this;
    }

    public function send($message = null)
    {
        if ($message) {
            $this->setMessage($message);
        }
        try {
            $message = $this->client
                ->messages
                ->create($this->getTo(), [
                    'body' => $this->message,
                    'messagingServiceSid' => $this->service,
                ]);

            $this->reset();
            return true;
        } catch (Exception $e) {
            Log::record($e);
            return false;
        }
    }
}
