<?php

namespace Exceptions;

use Throwable;

class ForbiddenHTTPException extends HTTPException
{
    public function __construct($message = 'Forbidden', $data = [], ?Throwable $previous = null)
    {
        parent::__construct($message, $data, 403, $previous);
    }
}
