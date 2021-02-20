<?php

namespace Interfaces\Queue;

use Throwable;

interface Queueable
{
    public function run();

    public function __serialize(): array;

    public function __unserialize(array $data): void;

    public function report(Throwable $exception): void;
}
