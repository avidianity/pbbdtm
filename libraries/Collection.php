<?php

namespace Libraries;

use ArrayAccess;
use Closure;
use Countable;
use Interfaces\Arrayable;
use Iterator;
use JsonSerializable;

class Collection implements ArrayAccess, Countable, Iterator, JsonSerializable, Arrayable
{
    /**
     * @var array
     */
    protected $items = [];
    protected $keys = [];

    public function __construct($items = [])
    {
        foreach ($items as $key => $item) {
            $this->items[$key] = $item;
        }
    }

    public function offsetSet($offset, $value)
    {
        if (is_null($offset)) {
            $this->items[] = $value;
        } else {
            $this->items[$offset] = $value;
        }
    }

    public function offsetExists($offset)
    {
        return isset($this->items[$offset]);
    }

    public function offsetUnset($offset)
    {
        unset($this->items[$offset]);
    }

    public function offsetGet($offset)
    {
        return $this->offsetExists($offset) ? $this->items[$offset] : null;
    }

    public function count()
    {
        return count($this->items);
    }

    public function rewind()
    {
        return reset($this->items);
    }

    public function current()
    {
        return current($this->items);
    }

    public function key()
    {
        return key($this->items);
    }

    public function next()
    {
        return next($this->items);
    }

    public function valid()
    {
        return $this->key() !== null;
    }

    public function all()
    {
        return $this->items;
    }

    public function map(Closure $callback)
    {
        $items = [];

        $callback->bindTo($this, $this);

        foreach ($this->all() as $key => $value) {
            $items[$key] = $callback($value, $key);
        }

        return new static($items);
    }

    public function each(Closure $callback)
    {
        $callback->bindTo($this, $this);

        foreach ($this->all() as $key => $value) {
            $callback($value, $key);
        }

        return $this;
    }

    public function filter(Closure $callback)
    {
        $items = [];

        $callback->bindTo($this, $this);

        foreach ($this->all() as $key => $value) {
            if ($callback($value, $key)) {
                $items[$key] = $value;
            }
        }

        return new static($items);
    }

    public function set($key, $value)
    {
        $this->offsetSet($key, $value);
        return $this;
    }

    public function get($key)
    {
        return $this->offsetGet($key);
    }

    public function remove($key)
    {
        $this->offsetUnset($key);
        return $this;
    }

    public function jsonSerialize()
    {
        return $this->all();
    }

    public function push($item)
    {
        $this->items[] = $item;

        return $this;
    }

    public function join($glue)
    {
        return implode($glue, $this->all());
    }

    public function toArray(): array
    {
        return $this->all();
    }
}
