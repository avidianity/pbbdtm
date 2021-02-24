<?php

namespace Libraries;

use Exception;

class Log
{
    protected static $path = null;

    public static function record($message, $data = [])
    {
        $path = static::getPath();

        if (!file_exists($path)) {
            file_put_contents($path, '');
        }
        $logs = file_get_contents($path);

        if ($message instanceof Exception) {
            $exception = $message;
            $message = (array)json_decode(json_encode($exception));

            $message['message'] = $exception->getMessage();
            $message['stacktrace'] = $exception->getTrace();
            $message['exception'] = get_class($exception);

            $message = json_encode($message);
        }

        $logs .= '[' . date('F j, Y, g:i a') . ']' . ' | ' . $message . ' | Data - ' . json_encode($data) . "\n";
        file_put_contents($path, $logs);
    }

    protected static function getPath()
    {
        if (!static::$path) {
            static::$path = config('logs.path');
        }
        return static::$path . 'avidian.log';
    }
}
