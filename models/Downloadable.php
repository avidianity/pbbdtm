<?php

namespace Models;

/**
 * @property File $file
 */
class Downloadable extends Model
{
    protected $fillable = ['name', 'file_id'];

    protected static function events()
    {
        static::deleted(function (self $downloadable) {
            $downloadable->file->delete();
        });
    }

    public function file()
    {
        return $this->belongsTo(File::class);
    }
}
