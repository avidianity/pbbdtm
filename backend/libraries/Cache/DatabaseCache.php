<?php

namespace Libraries\Cache;

use Interfaces\Cacheable;
use Models\Cache;
use Traits\Singleton;

/**
 * Reponsible for caching data into memory
 * @link https://en.wikipedia.org/wiki/Cache_(computing)
 */
class DatabaseCache implements Cacheable
{
    use Singleton;

    /**
     * Get a cached data
     *
     * @param string $key
     * @param mixed|null $default returned if the key does not exist
     * @return mixed|null
     */
    public function get($key, $default = null)
    {
        $pdo = Cache::getConnection();

        $query  = sprintf('SELECT * FROM %s WHERE %s = :key LIMIT 1', Cache::table(), Cache::justifyKey('key'));

        $statement = $pdo->prepare($query);

        $statement->execute([':key' => $this->resolve($key)]);

        if ($statement->rowCount() > 0) {
            $cache = Cache::from($statement->fetch());

            /**
             * @var Item
             */
            $item = unserialize($cache->value);

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
        $pdo = Cache::getConnection();

        $query  = sprintf('SELECT * FROM %s WHERE %s = :key LIMIT 1', Cache::table(), Cache::justifyKey('key'));

        $statement = $pdo->prepare($query);

        $statement->execute([':key' => $this->resolve($key)]);

        if ($statement->rowCount() > 0) {
            $cache = Cache::from($statement->fetch());
            $cache->value = serialize(new Item($key, $value));
        } else {
            $cache = new Cache(['key' => $this->resolve($key), 'value' => serialize(new Item($key, $value))]);
        }

        $cache->save();

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
        $pdo = Cache::getConnection();

        $query  = sprintf('SELECT * FROM %s WHERE %s = :key LIMIT 1', Cache::table(), Cache::justifyKey('key'));

        $statement = $pdo->prepare($query);

        $statement->execute([':key' => $this->resolve($key)]);

        if ($statement->rowCount() > 0) {
            $cache = Cache::from($statement->fetch());

            /**
             * @var Item
             */
            $item = unserialize($cache->value);

            if ($item->expired()) {
                $cache->delete();

                return false;
            }

            return true;
        }

        return false;
    }

    public function remove($key)
    {
        $pdo = Cache::getConnection();

        $query  = sprintf('DELETE FROM %s WHERE %s = :key LIMIT 1', Cache::table(), Cache::justifyKey('key'));

        $statement = $pdo->prepare($query);

        $statement->execute([':key' => $this->resolve($key)]);

        return $this;
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

    protected function resolve($key)
    {
        return sprintf('%s_%s', session()->id(), $key);
    }
}
