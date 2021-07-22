<?php

namespace Traits;

use Closure;

trait HasEvents
{
    protected static $events = [
        'creating' => [],
        'created' => [],
        'updating' => [],
        'updated' => [],
        'deleting' => [],
        'deleted' => [],
        'saving' => [],
        'saved' => [],
        'serializing' => [],
    ];

    protected static function registerEvent($type, $callable)
    {
        static::$events[$type][static::class] = $callable;
    }

    public function fireEvent($type)
    {
        if (in_array(static::class, array_keys(static::$events[$type]))) {
            $callable = static::$events[$type][static::class];
            if ($callable instanceof Closure) {
                $callable = $callable->bindTo($this, $this);
                $callable($this);
            }
        }
        return $this;
    }

    protected static function creating($callable)
    {
        static::registerEvent('creating', $callable);
    }

    protected static function created($callable)
    {
        static::registerEvent('created', $callable);
    }

    protected static function updating($callable)
    {
        static::registerEvent('updating', $callable);
    }

    protected static function updated($callable)
    {
        static::registerEvent('updated', $callable);
    }

    protected static function deleting($callable)
    {
        static::registerEvent('deleting', $callable);
    }

    protected static function deleted($callable)
    {
        static::registerEvent('deleted', $callable);
    }

    protected static function saving($callable)
    {
        static::registerEvent('saving', $callable);
    }

    protected static function saved($callable)
    {
        static::registerEvent('saved', $callable);
    }

    protected static function serializing($callable)
    {
        static::registerEvent('serializing', $callable);
    }

    protected static function events()
    {
        // 
    }
}
