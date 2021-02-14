<?php

namespace Models;

use DateTime;
use Libraries\Str;

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

    public static function checkExpired()
    {
        /**
         * @var static[]
         */
        $approved = array_filter(static::getAll(), function (self $request) {
            return $request->approved && !$request->expired;
        });
        foreach ($approved as $request) {
            $date = DateTime::createFromFormat('Y-m-d H:i:s', $request->updated_at);

            $now = time();

            $days = round(($now - $date->getTimestamp()) / (60 * 60 * 24));

            if ($days >= 15) {
                $request->update(['expired' => true]);
                $request->logs()->create(['action' => 'Request has expired.', 'user_id' => $request->user_id]);
                $user = $request->user;

                $data = [
                    'name' => $user->name,
                    'requestID' => $request->request_id,
                    'documentType' => $request->documentType->name,
                    'date' => DateTime::createFromFormat('Y-m-d H:i:s', $request->created_at)->format('F d, Y h:i A'),
                    'lastStatus' => $request->status,
                ];

                mailer()->setSubject('Request Expiration Notice')
                    ->setTo($user->email)
                    ->view('emails.expired-request', $data)
                    ->send();
            }
        }
    }

    protected static function events()
    {
        static::creating(function (self $request) {
            $request->request_id = Str::random(5) . '-' . Str::random(5) . '-' . date('Y');
        });

        static::saving(function (self $request) {
            $request->approved = $request->approved ? 1 : 0;
            $request->expired = $request->expired ? 1 : 0;
        });

        static::updated(function (self $request) {
            $data = [
                'name' => $request->user->name,
                'requestID' => $request->request_id,
                'updater' => user()->name,
                'date' => DateTime::createFromFormat('Y-m-d H:i:s', $request->created_at)->format('F d, Y h:i A'),
                'status' => $request->status,
            ];

            mailer()->setSubject('Request Updated')
                ->setTo($request->user->email)
                ->view('emails.updated-request', $data)
                ->send();
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
