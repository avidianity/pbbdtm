<?php

use Libraries\Database;

// Fetch environment
$env = config('app.env');

// Fetch configuration for database
$config = config('database.' . $env);

// Create connection string
$dsn = concatenate(
    $config['driver'],
    ':',
    'dbname=',
    $config['name'],
    ';host=',
    $config['host'],
    ';port=',
    $config['port']
);

// Create instance
$pdo = Database::getInstance($dsn, $config['username'], $config['password']);

// Throw exceptions on any SQL error
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Prevent emulating prepared statements in the database
$pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

// prevent numeric columns from being cast into a string
$pdo->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, false);

return $pdo;
