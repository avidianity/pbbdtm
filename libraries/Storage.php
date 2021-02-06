<?php

namespace Libraries;

class Storage
{
    public static function put($path, $binary)
    {
        $fullPath = static::getFullPath($path);

        return file_put_contents($fullPath, $binary) !== false;
    }

    public static function get($path)
    {
        return file_get_contents(static::getFullPath($path));
    }

    public static function delete($path)
    {
        return unlink(static::getFullPath($path));
    }

    protected static function getFullPath($path)
    {
        return config('storage.path') . $path;
    }
}
