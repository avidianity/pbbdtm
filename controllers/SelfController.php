<?php

namespace Controllers;

use Libraries\Hash;
use Models\File;
use Models\Request;
use Models\User;

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
        Request::checkExpired();
        return array_map(function (Request $request) {
            $request->load(['documentType', 'file']);

            return $request;
        }, $this->user->requests);
    }

    public function update()
    {
        $data = input()->only(['name', 'email', 'password', 'phone']);

        $pdo = User::getConnection();

        $errors = [];

        $query  = 'SELECT * FROM ' . (new User())->getTable() . ' ';
        $query .= 'WHERE email = :email AND id != :id LIMIT 1';

        $statement = $pdo->prepare($query);

        $statement->execute([':email' => $data['email'], ':id' => $this->user->id]);

        if ($statement->rowCount() !== 0) {
            $errors['email'] = ['Email already exists.'];
        }

        $query  = 'SELECT * FROM ' . (new User())->getTable() . ' ';
        $query .= 'WHERE name = :name AND id != :id LIMIT 1';

        $statement = $pdo->prepare($query);

        $statement->execute([':name' => $data['name'], ':id' => $this->user->id]);

        if ($statement->rowCount() !== 0) {
            $errors['name'] = ['Name already exists.'];
        }

        $query  = 'SELECT * FROM ' . (new User())->getTable() . ' ';
        $query .= 'WHERE phone = :phone AND id != :id LIMIT 1';

        $statement = $pdo->prepare($query);

        $statement->execute([':phone' => $data['phone'], ':id' => $this->user->id]);

        if ($statement->rowCount() !== 0) {
            $errors['phone'] = ['Phone already exists.'];
        }

        if (count($errors) > 0) {
            return response(['errors' => $errors], 422);
        }

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
