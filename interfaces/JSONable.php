<?php

namespace Interfaces;

use JsonSerializable;

/**
 * Allows casting into an object
 */
interface JSONable extends JsonSerializable
{
    public function toJSON(): object;
}
