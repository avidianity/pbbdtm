<?php

/**
 * All configurations are stored in this file
 */

return [
    'app' => [
        'url' => 'http://localhost:8000',
        'debug' => true,
        'env' => 'dev',
    ],
    'database' => [
        'dev' => [
            'driver' => 'mysql',
            'host' => '127.0.0.1',
            'username' => 'root',
            'password' => '191799',
            'name' => 'document',
            'port' => '3306',
        ],
        'prod' => [
            'driver' => 'postgres',
            'host' => 'john.db.elephantsql.com',
            'username' => 'xjqbjesi',
            'password' => 'NQbPguK8i1e0b8caQVhvuV-3UhomNyxa',
            'name' => 'xjqbjesi',
            'port' => '5432',
        ],
    ],
    'view' => [
        'path' => __DIR__ . '/views/',
    ],
    'storage' => [
        'path' => __DIR__ . '/storage/app/',
    ],
];
