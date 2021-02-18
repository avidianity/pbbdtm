<?php

namespace Interfaces\Queue;

use Serializable;

interface Queueable
{
    public function run();

    public function __serialize(): array;

    public function __unserialize(array $data): void;
}
