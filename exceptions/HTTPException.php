<?php

namespace Exceptions;

use Exception;
use Interfaces\Arrayable;
use Interfaces\JSONable;
use Throwable;

class HTTPException extends Exception implements JSONable, Arrayable
{
    protected $status = 500;
    protected $data = [];
    protected $headers = [];
    protected $debugMode = false;

    public function __construct($message, $data = [], $status, ?Throwable $previous = null)
    {
        parent::__construct($message, $this->status, $previous);

        $data['stacktrace'] = config('app.debug') ? $this->getTrace() : [];
        $data['message'] = $message;

        $this->data = $data;
        $this->setStatus($status);
    }

    public function toArray(): array
    {
        return $this->data;
    }

    public function toJSON(): object
    {
        return toObject($this->toArray());
    }

    public function jsonSerialize()
    {
        return $this->toArray();
    }

    public function setStatus($status)
    {
        $this->status = $status;
        return $this;
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function withHeaders($headers)
    {
        foreach ($headers as $key => $value) {
            $this->headers[$key] = $value;
        }
        return $this;
    }
}
