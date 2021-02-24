<?php

use Models\Model;
use Symfony\Component\Dotenv\Dotenv;

require_once __DIR__ . '/vendor/autoload.php';

date_default_timezone_set('Asia/Manila');

$env = __DIR__ . '/.env';

if (file_exists($env)) {
    $dotenv = new Dotenv();

    $dotenv->load($env);
}

$_ENV['CONFIGS'] = require_once __DIR__ . '/config.php';

$_ENV['MAP'] = require_once __DIR__ . '/map.php';

// Create database connection
$pdo = require_once __DIR__ . '/pdo.php';

// set default connection to finish setup
Model::setConnection($pdo);
