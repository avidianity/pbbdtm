<?php

namespace Models;

/**
 * @property Request[] $requests
 */
class DocumentType extends Model
{
    protected static $table = 'document_type';
    protected $fillable = ['name', 'requirements'];

    protected static function events()
    {
        static::deleting(function (self $type) {
            deleteMany($type->requests, Request::class);
        });
    }

    public function requests()
    {
        return $this->hasMany(Request::class);
    }
}
