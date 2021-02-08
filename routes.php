<?php

use Controllers\AuthController;
use Controllers\DocumentTypeController;
use Controllers\FileController;
use Controllers\RequestController;
use Controllers\SelfController;
use Controllers\UserController;
use Libraries\Router;
use Libraries\Str;
use Models\User;

$router = Router::getInstance();

$router->group('/api', function (Router $router) {
    $router->group('/auth', function (Router $router) {
        $router->post('/login', [AuthController::class, 'login']);
        $router->post('/register', [AuthController::class, 'register']);
        $router->post('/logout', [AuthController::class, 'logout']);
    });

    $router->apiResource('/requests', RequestController::class);
    $router->apiResource('/document-types', DocumentTypeController::class);
    $router->apiResource('/users', UserController::class);

    $router->group('/self', function (Router $router) {
        $router->get('/', [SelfController::class, 'self']);
        $router->put('/', [SelfController::class, 'update']);
        $router->put('/profile', [SelfController::class, 'profile']);
        $router->get('/requests', [SelfController::class, 'requests']);
    });

    $router->get('/file', [FileController::class, 'stream']);
});

$router->fallback(function () {
    return view('home');
});

return $router;
