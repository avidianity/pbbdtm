<?php

return [
    'storage' => [
        'file' => \Libraries\Storage\FileStorage::class,
        'database' => \Libraries\Storage\DatabaseStorage::class,
        'dropbox' => \Libraries\Storage\DropboxStorage::class,
    ]
];
