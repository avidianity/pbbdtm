<?php

namespace Models;

/**
 * @property Request[] $requests
 */
class DocumentType extends Model
{
    protected static $table = 'document_type';
    protected $fillable = ['name'];

    protected static function events()
    {
        static::deleting(function (self $type) {
            deleteMany($type->requests, static::class);
        });
    }

    public function requests()
    {
        return $this->hasMany(Request::class);
    }
}
