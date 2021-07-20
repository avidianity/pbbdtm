<?php

namespace Models;

class ForgotPassword extends Model
{
    protected static $table = 'forgot_password';

    protected $fillable = ['email', 'token'];
}
