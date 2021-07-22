<?php

namespace Models;

class Log extends Model
{
    protected $fillable = ['action', 'loggable_type', 'loggable_id', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function loggable()
    {
        return $this->morphTo('loggable');
    }
}
