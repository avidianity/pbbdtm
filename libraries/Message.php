<?php

namespace Libraries;

use Exception;
use Interfaces\Singleton as SingletonContract;
use Traits\Singleton;

class Message implements SingletonContract
{
    use Singleton;

    protected $to = '';
    protected $from = 'PBBDTM';
    protected $message = '';

    protected $token;

    /**
     * @var \Libraries\SemaphoreClient
     */
    protected $client = null;

    public function __construct()
    {
        $this->token = config('sms.token');
        $this->init();
    }

    protected function init()
    {
        $this->client = new SemaphoreClient($this->token);

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
            $this->client->send($this->getTo(), $this->message);

            $this->reset();
            return true;
        } catch (Exception $e) {
            Log::record($e);
            return false;
        }
    }
}
