<?php

namespace Libraries\Cache;

use Interfaces\Cacheable;
use Traits\Singleton;

/**
 * Reponsible for caching data into memory
 * @link https://en.wikipedia.org/wiki/Cache_(computing)
 */
class MemoryCache implements Cacheable
{
    use Singleton;

    /**
     * The cached data
     *
     * @var array
     */
    protected $data = [];

    /**
     * Get a cached data
     *
     * @param string $key
     * @param mixed|null $default returned if the key does not exist
     * @return mixed|null
     */
    public function get($key, $default = null)
    {
        if (in_array($key, array_keys($this->data))) {
            return unserialize($this->data[$key]);
        }
        return $default;
    }

    /**
     * Cache a data
     *
     * @param string $key
     * @param mixed $value
     * @return static
     */
    public function set($key, $value)
    {
        $this->data[$key] = serialize($value);
        return $this;
    }

    /**
     * Checks if a key exists
     *
     * @param string $key
     * @return boolean
     */
    public function has($key)
    {
        return in_array($key, array_keys($this->data));
    }

    /**
     * Stores a callable and returns its value
     *
     * @param string $key
     * @param callable $callable
     * @return mixed
     */
    public function store($key, $callable)
    {
        if (!$this->has($key)) {
            $this->set($key, $callable());
        }
        return $this->get($key);
    }
}
