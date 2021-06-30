<?php

namespace Models;

/**
 * @property User $user
 */
class Token extends Model
{
    protected $fillable = ['hash', 'user_id'];
    protected $hidden = ['hash'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
