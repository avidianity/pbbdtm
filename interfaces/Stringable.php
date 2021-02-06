<?php

namespace Interfaces;

use JsonSerializable;

interface Stringable extends JsonSerializable
{
    public function __toString();

    /**
     * @return static
     */
    public function toLowerCase();

    /**
     * @return static
     */
    public function toUpperCase();
}
