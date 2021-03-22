<?php

namespace Libraries;

/**
 * File that is uploaded
 * @property-read string $name
 * @property-read string $type
 * @property-read int $size
 * @property-read string $tmp_name
 * @property-read int $error
 */
class File
{
    protected $info = [];

    public function __construct($data)
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

    public function fetch()
    {
        return @file_get_contents($this->tmp_name);
    }

    public function put($dir)
    {
        return move_uploaded_file($this->tmp_name, $dir . basename($this->name));
    }
}
