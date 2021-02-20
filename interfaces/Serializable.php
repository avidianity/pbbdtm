<?php

namespace Interfaces;

interface Serializable
{
    public function __serialize(): array;

    public function __unserialize(array $data): void;
}
