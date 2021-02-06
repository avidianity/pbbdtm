<?php

namespace Libraries;

use Interfaces\Arrayable;
use Interfaces\JSONable;
use stdClass;
use Traits\Singleton;

class Input implements JSONable, Arrayable
{
    use Singleton;

    protected $data = [];

    public function __construct()
    {
        $stream = json_decode(file_get_contents('php://input'), true);
        if ($stream !== null) {
            foreach ($stream as $key => $value) {
                $this->data[$key] = $this->castToCorrectType($value);
            }
        }
        foreach ($_GET as $key => $value) {
            $this->data[$key] = $this->castToCorrectType($value);
        }
        foreach ($_POST as $key => $value) {
            $this->data[$key] = $this->castToCorrectType($value);
        }
        $this->convertEmptyStringsToNull();
        $this->clean();
    }

    protected function convertEmptyStringsToNull()
    {
        foreach ($this->data as $key => $value) {
            if (is_string($value) && strlen(trim($value)) === 0) {
                $this->data[$key] = null;
            }
        }
        return $this;
    }

    protected function clean()
    {
        foreach ($this->data as $key => $value) {
            if ($value === null) {
                unset($this->data[$key]);
            }
        }
        return $this;
    }

    protected function castToCorrectType($value)
    {

        if (is_numeric($value)) {
            if (is_double($value + 0) || is_float($value + 0)) {
                return (float)$value;
            }
            return (int)$value;
        }
        if (is_null($value)) {
            return null;
        }
        if (is_bool($value)) {
            return (bool)$value;
        }
        return $value;
    }

    /**
     * Get only the specified keys
     * 
     * @param array $keys
     * @return array
     */
    public function only($keys)
    {
        return only($this->data, $keys);
    }

    /**
     * Get except the specified keys
     * 
     * @param array $keys
     * @return array
     */
    public function except($keys)
    {
        return except($this->data, $keys);
    }

    /**
     * Get all inputs
     * 
     * @return array
     */
    public function all()
    {
        return $this->data;
    }

    /**
     * Get an input once and unset it if it exists
     * 
     * @return mixed
     */
    public function once($key, $default = null)
    {
        if (!in_array($key, array_keys($this->data))) {
            return $default;
        }
        $value = $this->data[$key];
        unset($this->data[$key]);
        return $value;
    }

    public function __get($name)
    {
        return $this->data[$name];
    }

    public function toArray(): array
    {
        return $this->data;
    }

    public function toJSON(): object
    {
        $object = new stdClass();

        foreach ($this->toArray() as $key => $value) {
            $object->{$key} = $value;
        }

        return $object;
    }

    /**
     * Specify data which should be encoded into JSON
     * 
     * @return mixed
     */
    public function jsonSerialize()
    {
        return $this->toJSON();
    }

    /**
     * Checks if a key exists from the input
     * 
     * @param string $key
     * @return bool
     */
    public function has($key)
    {
        return in_array($key, array_keys($this->data));
    }
}
