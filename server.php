<?php

use Libraries\Application;

$router = require __DIR__ . '/routes.php';

$app = new Application();

$app->setRouter($router);

return $app;
