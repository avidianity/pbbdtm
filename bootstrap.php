<?php

require_once __DIR__ . '/vendor/autoload.php';

use Models\Model;

$configs = require_once __DIR__ . '/config.php';

$_ENV['CONFIGS'] = $configs;

// Create database connection
$pdo = require_once __DIR__ . '/pdo.php';

// set default connection to finish setup
Model::setConnection($pdo);
