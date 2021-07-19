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

    public function __construct($message, $data = [], $status = 500, ?Throwable $previous = null)
    {
        parent::__construct($message, $this->status, $previous);

        $this->debugMode = config('app.debug');
        $this->data = $data;
        $this->setStatus($status);
    }

    public function toArray(): array
    {
        $data = [
            'status' => $this->status,
            'data' => $this->data,
        ];
        if ($this->debugMode) {
            $data['message'] = $this->message;
            $data['stacktrace'] = $this->getTrace();
        }
        return $data;
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

    public function getHeaders()
    {
        return $this->headers;
    }

    public function withHeaders($headers)
    {
        foreach ($headers as $key => $value) {
            $this->headers[$key] = $value;
        }
        return $this;
    }
}
