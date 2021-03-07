<?php

namespace Models;

class Task extends Model
{
    protected $fillable = ['for', 'title', 'done', 'request_id'];

    protected static function events()
    {
        static::saving(function (self $task) {
            $task->done = $task->done ? 1 : 0;
        });

        static::serializing(function (self $task) {
            $task->done = (bool)$task->done;
        });
    }
}
