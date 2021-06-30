<?php

namespace Exceptions;

use Throwable;

class MailerException extends HTTPException
{
    public function __construct($message = '', $data = [], ?Throwable $previous = null)
    {
        parent::__construct($message, $data, 500, $previous);
    }
}
