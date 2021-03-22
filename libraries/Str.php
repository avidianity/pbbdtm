<?php

namespace Libraries;

use Interfaces\Stringable;

class Str implements Stringable
{
    protected $data;

    public function __construct($data = '')
    {
        $this->data = $data;
    }

    public function __toString()
    {
        return $this->data;
    }

    public function toString()
    {
        return $this->__toString();
    }

    public static function random($length)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    public function toLowerCase()
    {
        $this->data = strtolower($this->data);
        return $this;
    }

    public function toUpperCase()
    {
        $this->data = strtoupper($this->data);
        return $this;
    }

    public function jsonSerialize()
    {
        return $this->data;
    }

    public function prepend($string)
    {
        $this->data = $string . $this->data;
        return $this;
    }

    public function append($string)
    {
        $this->data .= $string;
        return $this;
    }

    public static function from($data)
    {
        return new static($data);
    }
}
