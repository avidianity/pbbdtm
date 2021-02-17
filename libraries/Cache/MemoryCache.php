<?php

namespace Libraries\Cache;

use Interfaces\Cacheable;
use Traits\Singleton;

class MemoryCache implements Cacheable
{
    use Singleton;

    protected $data = [];

    public function get($key, $default = null)
    {
        if (in_array($key, array_keys($this->data))) {
            return $this->data[$key];
        }
        return $default;
    }

    public function set($key, $value)
    {
        $this->data[$key] = $value;
        return $this;
    }

    public function has($key)
    {
        return in_array($key, array_keys($this->data));
    }

    public function store($key, $callable)
    {
        if ($this->has($key)) {
            return $this->get($key);
        }
        $value = $callable();
        $this->set($key, $value);
        return $value;
    }
}
