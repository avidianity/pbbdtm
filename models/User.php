<?php

namespace Models;

use Traits\HasTokens;

/**
 * @property Request[] $requests
 * @property File|null $profilePicture
 */
class User extends Model
{
    use HasTokens;

    protected $fillable = ['name', 'email', 'phone', 'password', 'role', 'profile_picture_id', 'type', 'student_id_number'];
    protected $hidden = ['password'];

    protected static function events()
    {
        static::deleting(function (self $user) {
            deleteMany($user->tokens, static::class);
            deleteMany($user->requests, static::class);
        });

        static::deleted(function (self $user) {
            if ($user->profilePicture) {
                $user->profilePicture->delete();
            }
        });
    }

    public function requests()
    {
        return $this->hasMany(Request::class);
    }

    public function profilePicture()
    {
        return $this->belongsTo(File::class, 'profile_picture_id');
    }

    public function isAdmin()
    {
        return strtolower($this->role) === 'admin';
    }

    public function isStudent()
    {
        return strtolower($this->role) === 'student';
    }
}
