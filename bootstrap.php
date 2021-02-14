<?php

use Models\Model;
use Symfony\Component\Dotenv\Dotenv;

require_once __DIR__ . '/vendor/autoload.php';

date_default_timezone_set('Asia/Manila');

$dotenv = new Dotenv();

$dotenv->load(__DIR__ . '/.env');

$_ENV['CONFIGS'] = require_once __DIR__ . '/config.php';

$_ENV['MAP'] = require_once __DIR__ . '/map.php';

// Create database connection
$pdo = require_once __DIR__ . '/pdo.php';

// set default connection to finish setup
Model::setConnection($pdo);
