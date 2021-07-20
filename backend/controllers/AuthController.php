<?php

namespace Controllers;

use Libraries\Hash;
use Libraries\Str;
use Models\ForgotPassword;
use Models\User;
use Queues\SendMail;

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

        if (isset($data['student_id_number'])) {
            $query  = 'SELECT * FROM ' . (new User())->getTable() . ' ';
            $query .= 'WHERE student_id_number = :student_id_number LIMIT 1;';

            $statement = $pdo->prepare($query);

            $statement->execute([':student_id_number' => $data['student_id_number']]);

            if ($statement->rowCount() !== 0) {
                $errors['student_id_number'] = ['Student ID Number already exists.'];
            }
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

    public function forgotPassword()
    {
        $email = input()->get('email');

        if (!$email) {
            return response(['message' => 'Please provide a email address.'], 400);
        }

        $pdo = User::getConnection();

        $query  = sprintf('SELECT * FROM %s WHERE %s = :email LIMIT 1', User::table(), User::justifyKey('email'));

        $statement = $pdo->prepare($query);

        $statement->execute([':email' => $email]);

        if ($statement->rowCount() > 0) {
            return response(['message' => 'Email does not exist.'], 400);
        }

        $query  = sprintf('SELECT * FROM %s WHERE %s = :email LIMIT 1', ForgotPassword::table(), ForgotPassword::justifyKey('email'));

        $statement = $pdo->prepare($query);

        $statement->execute([':email' => $email]);

        if ($statement->rowCount() > 0) {
            return response(['message' => 'Email has already been sent a email token.'], 400);
        }

        $token = Str::random(40);

        ForgotPassword::create(['email' => $email, 'token' => $token]);

        queue()->register(new SendMail($email, 'emails.forgot-password', 'Forgot Password', [
            'url' => config('app.frontend.url') . '/reset-password/' . $token,
        ]));

        return response('', 204);
    }

    public function resetPassword()
    {
        $token = input()->get('token');

        if (!input()->has('password')) {
            return response(['message' => 'Please provide a password.'], 400);
        }

        $invalid = response(['message' => 'Invalid token.'], 400);

        if (!$token) {
            return $invalid;
        }

        $pdo = ForgotPassword::getConnection();

        $query  = sprintf('SELECT * FROM %s WHERE %s = :token LIMIT 1', ForgotPassword::table(), ForgotPassword::justifyKey('token'));

        $statement = $pdo->prepare($query);

        $statement->execute([':token' => $token]);

        if ($statement->rowCount() === 0) {
            return $invalid;
        }

        $model = ForgotPassword::from($statement->fetch());

        $query = sprintf('SELECT * FROM %s WHERE %s = :email LIMIT 1', User::table(), User::justifyKey('email'));

        $statement = $pdo->prepare($query);

        $statement->execute([':email' => $model->email]);

        if ($statement->rowCount() === 0) {
            return response(['message' => 'Email no longer exists.'], 400);
        }

        $user = User::from($statement->fetch());

        $user->update([
            'password' => Hash::make(input()->get('password')),
        ]);

        $model->delete();

        return response('', 204);
    }
}
