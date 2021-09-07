<?php

use Libraries\Application;

// Get the router with its defined routes
$router = require __DIR__ . '/routes.php';

// create application instance
$app = new Application();

// Store the router to the application
$app->setRouter($router);

$GLOBALS['app'] = $app;

// See /public/index.php line 14
return $app;
