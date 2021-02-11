<?php

namespace Controllers;

use DateTime;
use Libraries\Hash;
use Models\File;
use Models\Request;

class SelfController extends Controller
{
    /**
     * Currently authenticated user
     * 
     * @var \Models\User
     */
    protected $user;

    public function __construct()
    {
        auth();
        $this->user = user();
        $this->user->load(['profilePicture']);
    }

    public function self()
    {
        return $this->user;
    }

    public function requests()
    {
        $this->verifyRequests();
        return array_map(function (Request $request) {
            $request->load(['documentType', 'file']);

            return $request;
        }, $this->user->requests);
    }

    public function update()
    {
        $data = input()->only(['name', 'email', 'password', 'phone']);

        if (in_array('password', array_keys($data))) {
            $data['password'] = Hash::make($data['password']);
        }

        $this->user->update($data);

        return $this->user;
    }

    public function profile()
    {
        $raw = input()->file;

        $file = File::process($raw);

        $file->save();

        if ($this->user->profilePicture) {
            $this->user->profilePicture->delete();
        }

        $this->user->update([
            'profile_picture_id' => $file->id,
        ]);

        $this->user->load(['profilePicture']);

        return $this->user;
    }

    protected function verifyRequests()
    {
        /**
         * @var Request[]
         */
        $approved = array_filter(Request::getAll(), function (Request $request) {
            return $request->approved && !$request->expired;
        });
        foreach ($approved as $request) {
            $date = DateTime::createFromFormat('Y-m-d H:i:s', $request->updated_at);

            $now = time();

            $days = round(($now - $date->getTimestamp()) / (60 * 60 * 24));

            if ($days >= 15) {
                $request->update(['expired' => true]);
                $request->logs()->create(['action' => 'Request has expired.', 'user_id' => $request->user_id]);
            }
        }
    }
}
