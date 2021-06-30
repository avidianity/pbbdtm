<?php

namespace Interfaces;

use JsonSerializable;

/**
 * Allows casting into an object
 */
interface JSONable extends JsonSerializable
{
    /**
     * Cast into an object
     *
     * @return object
     */
    public function toJSON(): object;
}
