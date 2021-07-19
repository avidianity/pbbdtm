<?php

namespace Libraries\Cache;

use Interfaces\Serializable;

class Item implements Serializable
{
    public $key;
    public $value;
    protected $time;

    public function __construct($key, $value, $expiry = 60)
    {
        $this->key = $key;
        $this->value = $value;
        $this->time = time() + $expiry;
    }

    public function __serialize(): array
    {
        return [
            'key' => $this->key,
            'value' => serialize($this->value),
            'time' => $this->time,
        ];
    }

    public function __unserialize(array $data): void
    {
        $this->key = $data['key'];
        $this->value = unserialize($data['value']);
        $this->time = $data['time'];
    }

    public function expired()
    {
        return $this->time < time();
    }
}
