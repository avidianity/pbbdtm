<?php

use Models\Model;
use Symfony\Component\Dotenv\Dotenv;

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = new Dotenv();

$dotenv->load(__DIR__ . '/.env');

$_ENV['CONFIGS'] = require_once __DIR__ . '/config.php';

// Create database connection
$pdo = require_once __DIR__ . '/pdo.php';

// set default connection to finish setup
Model::setConnection($pdo);
