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

// Set object as default fetch mode
$pdo->setAttribute(Database::ATTR_DEFAULT_FETCH_MODE, Database::FETCH_OBJ);

// Throw exceptions on any SQL error
$pdo->setAttribute(Database::ATTR_ERRMODE, Database::ERRMODE_EXCEPTION);

// Prevent emulating prepared statements in the database
$pdo->setAttribute(Database::ATTR_EMULATE_PREPARES, false);

// prevent numeric columns from being cast into a string
$pdo->setAttribute(Database::ATTR_STRINGIFY_FETCHES, false);

return $pdo;
