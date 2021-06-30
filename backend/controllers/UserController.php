<?php

namespace Controllers;

use Libraries\Hash;
use Models\User;

class UserController extends Controller
{
    public function __construct()
    {
        auth(function (User $user) {
            return $user->isAdmin();
        });
    }

    public function index()
    {
        return array_map(function (User $user) {
            $user->load(['profilePicture']);

            return $user;
        }, User::getAll());
    }

    public function show()
    {
        $id = input()->id;
        $user = User::findOrFail($id);
        return $user->load(['profilePicture']);
    }

    public function store()
    {
        $data = input()->all();

        $data['password'] = Hash::make($data['password']);

        return User::create($data);
    }

    public function update()
    {
        $id = input()->once('id');

        $user = User::findOrFail($id);

        $data = input()->all();

        if (in_array('password', array_keys($data))) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return $user;
    }

    public function destroy()
    {
        $id = input()->once('id');

        if ($id === user()->id) {
            return response([
                'message' => 'You cannot delete your own account.',
            ], 403);
        }

        $user = User::findOrFail($id);

        $user->delete();

        return response('', 204);
    }
}
