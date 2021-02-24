<?php

/**
 * All configurations are stored in this file
 */

return [
    'app' => [
        'url' => env('APP_URL', 'http://localhost:8000'),
        'debug' => (bool)env('APP_DEBUG', true),
        'env' => env('APP_ENV', 'dev'),
    ],
    'database' => [
        'dev' => [
            'driver' => env('DB_DRIVER', 'mysql'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD'),
            'name' => env('DB_NAME'),
            'port' => env('DB_PORT', 3306),
        ],
        'prod' => [
            'driver' => env('DB_DRIVER', 'mysql'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD'),
            'name' => env('DB_NAME'),
            'port' => env('DB_PORT', 3306),
        ]
    ],
    'view' => [
        'path' => __DIR__ . '/views/',
    ],
    'storage' => [
        'driver' => env('STORAGE_DRIVER', 'file'),
        'file' => [
            'path' => __DIR__ . '/storage/app/',
        ],
        'dropbox' => [
            'token' => env('DROPBOX_TOKEN')
        ]
    ],
    'cache' => [
        'driver' => env('CACHE_DRIVER', 'memory'),
    ],
    'logs' => [
        'path' => __DIR__ . '/storage/logs/',
    ],
    'email' => [
        'host' => env('EMAIL_HOST', 'smtp.google.com'),
        'username' => env('EMAIL_USERNAME'),
        'password' => env('EMAIL_PASSWORD'),
        'port' => env('EMAIL_PORT'),
    ],
    'sms' => [
        'token' => env('SEMAPHORE_TOKEN'),
    ],
    'queue' => [
        'driver' => env('QUEUE_DRIVER', 'file'),
        'file' => [
            'path' => __DIR__ . '/storage/queue/'
        ]
    ]
];
