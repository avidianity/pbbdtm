<?php

namespace Controllers;

use Libraries\Hash;
use Models\User;

/**
 * Responsible for any authentication-related actions
 */
class AuthController extends Controller
{
    /**
     * Log a user in
     *
     * @return \Libraries\Response
     */
    public function login()
    {
        $data = input()->only(['email', 'password']);
        $pdo = User::getConnection();

        $query  = 'SELECT * FROM ' . (new User())->getTable() . ' ';
        $query .= 'WHERE email = :email LIMIT 1;';

        $statement = $pdo->prepare($query);

        $statement->execute([':email' => $data['email']]);

        if ($statement->rowCount() === 0) {
            return response([
                'message' => 'User does not exist.',
            ], 404);
        }

        $user = User::from($statement->fetchObject());

        $user->load(['profilePicture']);

        if (!Hash::check($data['password'], $user->password)) {
            return response(['message' => 'Wrong password.'], 403);
        }

        return response([
            'user' => $user,
            'token' => $user->createToken(),
        ]);
    }

    /**
     * Register a user
     *
     * @return \Libraries\Response
     */
    public function register()
    {
        $data = input()->only(['email', 'phone', 'password', 'name', 'type', 'student_id_number']);

        $data['password'] = Hash::make($data['password']);

        $pdo = User::getConnection();

        $errors = [];

        $query  = 'SELECT * FROM ' . (new User())->getTable() . ' ';
        $query .= 'WHERE student_id_number = :student_id_number LIMIT 1;';

        $statement = $pdo->prepare($query);

        $statement->execute([':student_id_number' => $data['student_id_number']]);

        if ($statement->rowCount() !== 0) {
            $errors['student_id_number'] = ['Student ID Number already exists.'];
        }

        $query  = 'SELECT * FROM ' . (new User())->getTable() . ' ';
        $query .= 'WHERE email = :email LIMIT 1;';

        $statement = $pdo->prepare($query);

        $statement->execute([':email' => $data['email']]);

        if ($statement->rowCount() !== 0) {
            $errors['email'] = ['Email already exists.'];
        }

        $query  = 'SELECT * FROM ' . (new User())->getTable() . ' ';
        $query .= 'WHERE name = :name LIMIT 1;';

        $statement = $pdo->prepare($query);

        $statement->execute([':name' => $data['name']]);

        if ($statement->rowCount() !== 0) {
            $errors['name'] = ['Name already exists.'];
        }

        $query  = 'SELECT * FROM ' . (new User())->getTable() . ' ';
        $query .= 'WHERE phone = :phone LIMIT 1;';

        $statement = $pdo->prepare($query);

        $statement->execute([':phone' => $data['phone']]);

        if ($statement->rowCount() !== 0) {
            $errors['phone'] = ['Phone already exists.'];
        }

        if (count($errors) > 0) {
            return response(['errors' => $errors], 422);
        }

        $data['role'] = 'Applicant';

        $user = User::create($data);

        return response([
            'user' => $user,
            'token' => $user->createToken(),
        ], 201);
    }

    /**
     * Log a user out
     *
     * @return \Libraries\Response
     */
    public function logout()
    {
        $token = getBearerModel();

        if ($token) {
            $token->delete();
        }

        return response('', 204);
    }
}
