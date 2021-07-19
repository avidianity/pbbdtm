<?php

namespace Libraries\Cache;

use Interfaces\Cacheable;
use Traits\Singleton;

/**
 * Reponsible for caching data into memory
 * @link https://en.wikipedia.org/wiki/Cache_(computing)
 */
class FileCache implements Cacheable
{
    use Singleton;

    protected $path;

    public function __construct()
    {
        $this->path = config('cache.path');
    }

    /**
     * Get a cached data
     *
     * @param string $key
     * @param mixed|null $default returned if the key does not exist
     * @return mixed|null
     */
    public function get($key, $default = null)
    {
        if ($this->has($key)) {
            /**
             * @var Item
             */
            $item = unserialize(file_get_contents($this->resolve($key)));

            if ($item->expired()) {
                $this->remove($key);

                return $default;
            }

            return $item->value;
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
        file_put_contents($this->resolve($key), serialize(new Item($key, $value)));
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
        if (file_exists($this->resolve($key))) {
            /**
             * @var Item
             */
            $item = unserialize(file_get_contents($this->resolve($key)));
            if (!$item->expired()) {
                return true;
            }
            $this->remove($key);
        }
        return false;
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

    public function remove($key)
    {
        unlink($this->resolve($key));

        return $this;
    }

    protected function resolve($key)
    {
        return sprintf('%s/%s_%s.cache', $this->path, session()->id(), $key);
    }
}
