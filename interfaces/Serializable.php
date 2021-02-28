<?php

namespace Interfaces;

/**
 * Allows serializing objects for storing
 * @link https://en.wikipedia.org/wiki/Serialization
 */
interface Serializable
{
    /**
     * Serialize the current instance
     *
     * @return array
     */
    public function __serialize(): array;

    /**
     * Unserialize the data
     *
     * @param array $data
     * @return void
     */
    public function __unserialize(array $data): void;
}
