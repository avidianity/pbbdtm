<?php

namespace Libraries;

use LogicException;
use Traits\Singleton;

class View
{
    use Singleton;

    protected $dir;
    protected $path;
    protected $data;
    protected $status = 200;

    public function __construct($path, $data = [])
    {
        $this->path = $path;
        $this->data = [];
        foreach ($data as $key => $value) {
            $this->data[$key] = $value;
        }
        $this->dir = config('view.path');
    }

    public static function parse($path)
    {
        $view = new static($path);

        $raw = @file_get_contents($view->getDir() . $view->getPath() . '.php');

        if (!static::exists($path) || !$raw) {
            throw new LogicException($path . ' does not exist in views.');
        }

        return $raw;
    }

    public function getPath()
    {
        return str_replace('.', '/', $this->path);
    }

    public function setPath($path)
    {
        $this->path = $path;
        return $this;
    }

    public function setData($data)
    {
        $this->data = $data;
        return $this;
    }

    public function getDir()
    {
        return $this->dir;
    }

    public function setStatus($status)
    {
        $this->status = $status;
        return $this;
    }

    public function render(Application $app)
    {
        $app->setView($this);
        $path = $this->getPath();
        if (!file_exists($this->dir . $path . '.php')) {
            throw new LogicException($path . ' does not exist in views.');
        }

        $app->setView($this);

        http_response_code($this->status);
        $callable = (function () {
            foreach ($this->getView()->getAllData() as $key => $value) {
                $$key = $value;
            }

            require_once $this->getView()->getDir() . $this->getView()->getPath() . '.php';
        })->bindTo($app, $app);

        $callable();
        exit;
    }

    public static function exists($path)
    {
        $instance = static::getInstance($path);
        return file_exists($instance->getDir() . $instance->getPath() . '.php');
    }

    public function hasData($key)
    {
        return in_array($key, array_keys($this->data));
    }

    public function getAllData()
    {
        return $this->data;
    }

    public function getData($key)
    {
        return $this->data[$key];
    }
}
