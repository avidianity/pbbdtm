<?php

namespace Libraries;

use Traits\Singleton;

class Session
{
    use Singleton;

    protected $id;

    public function __construct()
    {
        session_start();

        if (!$this->has('id')) {
            $this->set('id', Str::random(40));
        }

        $this->id = $this->get('id');
    }

    public function id()
    {
        return $this->id;
    }

    public function get($key, $default = null)
    {
        if ($this->has($key)) {
            return $_SESSION[$key];
        }
        return $default;
    }

    public function set($key, $value)
    {
        $_SESSION[$key] = $value;

        return $this;
    }

    public function has($key)
    {
        return in_array($key, $_SESSION) || isset($_SESSION[$key]);
    }

    public function remove($key)
    {
        unset($_SESSION[$key]);

        return $this;
    }
}
