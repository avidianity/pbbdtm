<?php

namespace Interfaces;

use JsonSerializable;

/**
 * Allows objects to be cast into a string as well as implement extra helper methods to manipulate it.
 */
interface Stringable extends JsonSerializable
{
    /**
     * Cast the object into a string
     *
     * @return string
     */
    public function __toString();

    /**
     * Transform into lowercase
     * 
     * @return static
     */
    public function toLowerCase();

    /**
     * Tranform to uppercase
     * 
     * @return static
     */
    public function toUpperCase();

    /**
     * Prepend to the current instance
     * 
     * @param string $string
     * @return static
     */
    public function prepend($string);

    /**
     * Append to the current instance
     * 
     * @param string $string
     * @return static
     */
    public function append($string);
}
