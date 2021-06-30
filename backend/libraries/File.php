<?php

namespace Libraries;

use Interfaces\Arrayable;
use Interfaces\JSONable;
use stdClass;

/**
 * File that is uploaded
 * @property string $name
 * @property string $type
 * @property int $size
 * @property string $tmp_name
 * @property int $error
 */
class File implements JSONable, Arrayable
{
    protected $info = [];

    public function __construct($data = [])
    {
        foreach ($data as $key => $value) {
            $this->info[$key] = $value;
        }
    }

    public function __get($key)
    {
        if (in_array($key, array_keys($this->info))) {
            return $this->info[$key];
        }
        return null;
    }

    public function __set($key, $value)
    {
        $this->info[$key] = $value;
    }

    public function fetch()
    {
        return @file_get_contents($this->tmp_name);
    }

    public function put($dir)
    {
        return move_uploaded_file($this->tmp_name, $dir . basename($this->name));
    }

    public function toArray(): array
    {
        return $this->info;
    }

    public function toJSON(): object
    {
        $object = new stdClass();

        foreach ($this->toArray() as $key => $value) {
            $object->{$key} = $value;
        }

        return $object;
    }

    public function jsonSerialize()
    {
        return $this->toJSON();
    }
}
