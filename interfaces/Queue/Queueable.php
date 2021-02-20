<?php

namespace Interfaces\Queue;

use Interfaces\Serializable;
use Throwable;

interface Queueable extends Serializable
{
    public function run();

    public function report(Throwable $exception): void;
}
