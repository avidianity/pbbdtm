<?php

namespace Exceptions;

use Throwable;

class NotFoundException extends HTTPException
{
    public function __construct($message = 'Page Not Found', $data = [], ?Throwable $previous = null)
    {
        parent::__construct($message, $data, 404, $previous);
    }
}
