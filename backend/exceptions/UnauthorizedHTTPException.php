<?php

namespace Exceptions;

use Throwable;

class UnauthorizedHTTPException extends HTTPException
{
    public function __construct($message = 'Unauthorized', $data = [], ?Throwable $previous = null)
    {
        parent::__construct($message, $data, 401, $previous);
    }
}
