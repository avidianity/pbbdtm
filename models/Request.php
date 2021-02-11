<?php

namespace Models;

/**
 * @property User $user
 * @property DocumentType $documentType
 * @property File|null $file
 * @property Log[] $logs
 */
class Request extends Model
{
    protected $fillable = [
        'user_id',
        'document_type_id',
        'approved',
        'file_id',
        'status',
        'expired',
    ];


    protected static function events()
    {
        static::saving(function (self $request) {
            $request->approved = $request->approved ? 1 : 0;
            $request->expired = $request->expired ? 1 : 0;
        });

        static::serializing(function (self $request) {
            $request->approved = (bool)$request->approved;
            $request->expired = (bool)$request->expired;
        });

        static::deleting(function (self $request) {
            deleteMany($request->logs, Log::class);
        });

        static::deleted(function (self $request) {
            if ($request->file !== null) {
                $request->file->delete();
            }
        });
    }

    public function logs()
    {
        return $this->morphMany(Log::class, 'loggable');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function file()
    {
        return $this->belongsTo(File::class);
    }
}
