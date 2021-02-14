<?php

use Controllers\AuthController;
use Controllers\CMSController;
use Controllers\ContactsController;
use Controllers\DocumentTypeController;
use Controllers\DownloadableController;
use Controllers\FileController;
use Controllers\LogController;
use Controllers\RequestController;
use Controllers\SelfController;
use Controllers\StatisticsController;
use Controllers\UserController;
use Libraries\Router;

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
    $router->apiResource('/cms', CMSController::class);
    $router->apiResource('/downloadables', DownloadableController::class);
    $router->apiResource('/contacts', ContactsController::class);

    $router->group('/self', function (Router $router) {
        $router->get('/', [SelfController::class, 'self']);
        $router->put('/', [SelfController::class, 'update']);
        $router->patch('/', [SelfController::class, 'update']);
        $router->put('/profile', [SelfController::class, 'profile']);
        $router->patch('/profile', [SelfController::class, 'profile']);
        $router->get('/requests', [SelfController::class, 'requests']);
    });

    $router->get('/file', [FileController::class, 'stream']);
    $router->get('/logs', LogController::class);
    $router->get('/statistics', StatisticsController::class);
});

$router->fallback(function () {
    return view('home');
});

return $router;
