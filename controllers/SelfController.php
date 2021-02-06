<?php

namespace Controllers;

use Libraries\Hash;
use Models\File;

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
        return $this->user->requests;
    }

    public function update()
    {
        $data = input()->only(['name', 'email', 'password']);

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
}
