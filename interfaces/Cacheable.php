<?php

namespace Interfaces;

interface Cacheable extends Singleton
{
    public function get($key, $default = null);
    public function set($key, $value);
    public function has($key);
    public function store($key, $callable);
}
