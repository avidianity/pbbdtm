<?php

namespace Models;

class RequestFile extends Model
{
    protected static $table = 'request_file';
    protected $fillable = ['file_id', 'request_id'];

    protected static function events()
    {
        static::deleted(function (self $type) {
            $type->file->delete();
        });
    }

    public function file()
    {
        return $this->belongsTo(File::class);
    }

    public function request()
    {
        return $this->belongsTo(Request::class);
    }
}
