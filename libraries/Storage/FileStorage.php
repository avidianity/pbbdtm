<?php

namespace Libraries\Storage;

use Interfaces\Storage;
use Traits\Singleton;

class FileStorage implements Storage
{
    use Singleton;

    protected $dir;

    public function __construct()
    {
        $this->dir = config('storage.file.path');
    }

    public function put($path, $binary)
    {
        $fullPath = $this->getFullPath($path);

        return file_put_contents($fullPath, $binary) !== false;
    }

    public function get($path)
    {
        return file_get_contents($this->getFullPath($path));
    }

    public function delete($path)
    {
        return unlink($this->getFullPath($path));
    }

    public function getFullPath($path)
    {
        return $this->dir . $path;
    }

    public function exists($path)
    {
        return file_exists($this->getFullPath($path));
    }
}
