<?php

namespace Exceptions;

use Throwable;

class SemaphoreException extends HTTPException
{
    public function __construct($message = '', $data = [], ?Throwable $previous = null)
    {
        parent::__construct($message, $data, 400, $previous);
    }
}
