<?php

namespace Models;

use DateTime;
use Libraries\Str;
use Queues\SendMail;
use Queues\SendMessage;

/**
 * @property User $user
 * @property DocumentType $documentType
 * @property File|null $file
 * @property Log[] $logs
 * @property Task[] $tasks
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
        'acknowledged',
        'evaluation',
        'copies',
        'reason',
    ];

    public static function checkExpired()
    {
        foreach (static::getApproved() as $request) {
            if ($request->getDaysFromNow() >= 5) {
                $request->markAsExpired();
            }
        }
        foreach (static::getNonReleasing() as $request) {
            if ($request->getDaysFromNow() >= $request->documentType->expiry_days) {
                $request->markAsExpired();
            }
        }
    }

    /**
     * @return static[]
     */
    protected static function getApproved()
    {
        return collect(static::getAll())->filter(function (self $request) {
            return $request->approved && !$request->expired;
        });
    }

    /**
     * @return static[]
     */
    public static function getExpiring()
    {
        return collect(static::getAll())->map(function (self $request) {
            $request->load(['user', 'documentType']);
            return $request;
        })
            ->filter(function (self $request) {
                return $request->getDaysFromNow() >= $request->documentType->expiry_days - 1;
            });
    }

    /**
     * @return static[]
     */
    protected static function getNonReleasing()
    {
        return collect(static::getAll())->filter(function (self $request) {
            return !in_array($request->status, ['Releasing', 'Released', 'Rejected']);
        });
    }

    public function getDaysFromNow()
    {
        $date = DateTime::createFromFormat('Y-m-d H:i:s', $this->updated_at);

        $now = time();

        return round(($now - $date->getTimestamp()) / (60 * 60 * 24));
    }

    public function markAsExpired()
    {
        $this->update(['expired' => true]);
        $this->logs()->create(['action' => 'Request has expired.', 'user_id' => $this->user_id]);
        $user = $this->user;

        $data = [
            'name' => $user->name,
            'requestID' => $this->request_id,
            'documentType' => $this->documentType->name,
            'date' => DateTime::createFromFormat('Y-m-d H:i:s', $this->created_at)->format('F d, Y h:i A'),
            'lastStatus' => $this->status,
        ];

        queue()->register(new SendMail($user->email, 'emails.expired-request', 'Request Expiration Notice', $data));

        $text  = 'You Request (ID: ' . $this->request_id . ') has expired. It was created at ' . $data['date'] . '. It\'s last status was \'' . $this->status . '\'.';
        $text .= sprintf('%s%s', config('app.frontend.url'), "/dashboard/requests/{$this->id}");

        queue()->register(new SendMessage($user->phone, $text));
    }

    protected static function events()
    {
        static::creating(function (self $request) {
            $request->request_id = Str::from(Str::random(5) . '-' . Str::random(5) . '-' . date('Y'))
                ->toLowerCase()
                ->toString();
        });

        static::saving(function (self $request) {
            $request->approved = $request->approved ? 1 : 0;
            $request->expired = $request->expired ? 1 : 0;
            $request->acknowledged = $request->acknowledged ? 1 : 0;
        });

        static::updating(function (self $request) {
            $clean = static::findOrFail($request->id);
            if ($clean->status !== $request->status) {
                $data = [
                    'name' => $request->user->name,
                    'requestID' => $request->request_id,
                    'updater' => user()->name,
                    'date' => DateTime::createFromFormat('Y-m-d H:i:s', $request->created_at)->format('F d, Y h:i A'),
                    'status' => $request->status,
                ];

                queue()->register(new SendMail($request->user->email, 'emails.updated-request', 'Request Updated', $data));
            }
        });

        static::serializing(function (self $request) {
            $request->approved = (bool)$request->approved;
            $request->expired = (bool)$request->expired;
            $request->acknowledged = (bool)$request->acknowledged;
        });

        static::deleting(function (self $request) {
            deleteMany($request->logs, Log::class);
            deleteMany($request->tasks, Task::class);
        });

        static::deleted(function (self $request) {
            if ($request->file !== null) {
                $request->file->delete();
            }
        });
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
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

    public function files()
    {
        return $this->hasMany(RequestFile::class);
    }
}
