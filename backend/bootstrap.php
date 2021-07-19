<?php

use Models\Model;
use Symfony\Component\Dotenv\Dotenv;

// Load all necessary files from the vendor folder
require_once __DIR__ . '/vendor/autoload.php';

date_default_timezone_set('Asia/Manila');

// The .env file path
$env = __DIR__ . '/.env';

// We will load the .env variables and store them if they exist in the current environment
if (file_exists($env)) {
    $dotenv = new Dotenv();

    $dotenv->load($env);
}

// store the configurations
$_ENV['CONFIGS'] = require_once __DIR__ . '/config.php';

// store the mappings
$_ENV['MAP'] = require_once __DIR__ . '/map.php';

// Create database connection
$pdo = require_once __DIR__ . '/pdo.php';

// set default connection to finish setup
Model::setConnection($pdo);

session();

// Setup done
