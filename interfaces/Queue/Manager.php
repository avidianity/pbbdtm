<?php

namespace Interfaces\Queue;

use Interfaces\Singleton;

interface Manager extends Singleton
{
    public function register(Queueable $queueable);
    public function work();
}
