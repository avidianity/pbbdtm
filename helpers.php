<?php

use Exceptions\UnauthorizedHTTPException;
use Interfaces\Arrayable;
use Interfaces\JSONable;
use Libraries\Input;
use Libraries\Mailer;
use Libraries\Message;
use Libraries\Response;
use Libraries\Str;
use Libraries\View;
use Models\Token;

/**
 * Return a file from the views folder
 * 
 * @param string $path
 * @return View
 */
function view($path, $data = [])
{
    return View::getInstance($path, $data)
        ->setPath($path)
        ->setData($data);
}

/**
 * Get the cache instance
 * 
 * @return \Interfaces\Cacheable
 */
function cache()
{
    $driver = config('cache.driver');
    $class = map('cache.' . $driver);

    return $class::getInstance();
}


/**
 * Get the mailer instance
 * 
 * @return \Libraries\Mailer
 */
function mailer()
{
    return Mailer::getInstance(...func_get_args());
}

/**
 * Get the queue manager instance
 * 
 * @return \Interfaces\Queue\Manager
 */
function queue()
{
    $driver = config('queue.driver');
    $class = map('queue.' . $driver);

    return $class::getInstance();
}

/**
 * Get the storage instance
 * 
 * @return \Interfaces\Storage
 */
function storage()
{
    $driver = config('storage.driver');
    $class = map('storage.' . $driver);

    return $class::getInstance();
}

/**
 * Get the message instance
 * 
 * @return \Libraries\Message
 */
function message()
{
    return Message::getInstance();
}

/**
 * Get a class name from the map 
 * 
 * @return string
 */
function map($path)
{
    $value = null;
    $map = $_ENV['MAP'];
    if ($path === null) {
        return $map;
    }
    foreach (explode('.', $path) as $key) {
        if ($value === null) {
            $value = $map[$key];
        } else {
            $value = $value[$key];
        }
    }
    return $value;
}

/**
 * Get an environment value
 * 
 * @param string $key
 * @param mixed|null $default
 * @return mixed|null
 */
function env($key, $default = null)
{
    if (!in_array($key, array_keys($_ENV))) {
        return $default;
    }
    return $_ENV[$key];
}


/**
 * Delete a collection of models
 * 
 * @param \Models\Model[] $models
 * @param string $class
 * @return void
 */
function deleteMany($models, $class)
{
    if (count($models) === 0) {
        return;
    }
    $ids = [];
    foreach ($models as $model) {
        $ids[] = $model->id;
    }
    $class::deleteMany($ids);
}

/**
 * Redirects to another url or page
 * 
 * @param $uri
 * @return void
 */
function redirect($path)
{
    $separator = '';
    if ($path[0] !== '/') {
        $separator = '/';
    }
    $url = config('app.url') . $separator . $path;
    header("Location: {$url}");
    exit;
}

/**
 * Create an url with the given path
 * 
 * @param string $path
 * @return string
 */
function asset($path)
{
    $separator = '';
    if ($path[0] !== '/') {
        $separator = '/';
    }
    return config('app.url') . $separator . $path;
}

/**
 * Dumps the data of the given value
 * 
 * @param mixed $data
 * @param string $mode
 * @return mixed
 */
function dump($data, $mode = 'var_export')
{
    if ($data instanceof JSONable) {
        $data = $data->toJSON();
    }
    if ($data instanceof Arrayable) {
        $data = $data->toArray();
    }
    if (is_array($data)) {
        $data = serializeArray($data);
    }
    return $mode($data);
}

/**
 * Recursively import all the files inside a directory
 * 
 * @param string $path
 * @return void
 */
function importRecursive($path)
{
    if (is_array($path)) {
        foreach ($path as $p) {
            importRecursive($p);
        }
        return;
    }
    if (is_string($path)) {
        foreach (glob(__DIR__ . "/{$path}/*.php") as $path) {
            require_once $path;
        }
    }
}

/**
 * Trigger a HTTP response
 * 
 * @param mixed $data
 * @param string $contentType
 * @param int $statusCode
 * @return Response
 */
function response($data, $statusCode = 200, $headers = [])
{
    return new Response($data, $statusCode, $headers);
}

/**
 * Serialize an array
 * 
 * @param array $array
 * @return array
 */
function serializeArray($array)
{
    return array_map(function ($element) {
        if ($element instanceof JSONable) {
            return $element->toJSON();
        } else if ($element instanceof Arrayable) {
            return $element->toArray();
        } else if (is_array($element)) {
            return serializeArray($element);
        } else if (is_object($element)) {
            return serializeArray(toArray($element));
        } else {
            return $element;
        }
    }, $array);
}

/**
 * Get the currently authenticated user
 * 
 * @return \Models\User|null
 */
function user()
{
    return cache()->store('user', function () {
        $token = getBearerModel();

        if (!$token) {
            return null;
        }

        return $token->user;
    });
}

/**
 * Cast into an array
 * 
 * @param iterable $iterable
 * @return array
 */
function toArray($iterable)
{
    $array = [];
    foreach ($iterable as $key => $value) {
        if ($value instanceof JSONable) {
            $array[$key] = $value->toJSON();
        } else if ($value instanceof Arrayable) {
            $array[$key] = $value->toArray();
        } else if (is_iterable($value) || is_object($value) || is_array($value)) {
            $array[$key] = toArray($value);
        } else {
            $array[$key] = $value;
        }
    }
    return $array;
}

/**
 * Cast into an object
 * 
 * @return interable $iterable
 * @return object
 */
function toObject($iterable)
{
    $object = new stdClass();
    foreach ($iterable as $key => $value) {
        if ($value instanceof JSONable) {
            $object->{$key} = $value->toJSON();
        } else if ($value instanceof Arrayable) {
            $object->{$key} = toObject($value->toArray());
        } else if (is_iterable($value) || is_object($value) || is_array($value)) {
            $object->{$key} = toObject($value);
        } else {
            $object->{$key} = $value;
        }
    }
    return $object;
}

/**
 * Get the current request's inputs
 * 
 * @return \Libraries\Input
 */
function input()
{
    return Input::getInstance();
}

/**
 * Aborts to a 'Unauthorized' response if there is no authenticated user
 * 
 * @param Closure|null $callable
 * @return void
 */
function auth($callable = null)
{
    $user = user();
    if (!$user) {
        throw new UnauthorizedHTTPException();
    }
    if ($callable && $callable instanceof Closure && $callable($user) === false) {
        throw new UnauthorizedHTTPException();
    }
}

/**
 * Connect elements into a single string
 * 
 * @return \Interfaces\Stringable
 */
function concatenate()
{
    $string = '';
    foreach (func_get_args() as $fragment) {
        $string .= $fragment;
    }
    return new Str($string);
}

/**
 * Cast into a string
 * 
 * @param mixed $data
 * @return \Interfaces\Stringable
 */
function toString($data)
{
    return new Str((string)$data);
}

/**
 * Get the current bearer token if it exists
 * 
 * @return string|null
 */
function getBearer()
{
    return cache()->store('bearer', function () {
        $token = getHeader('Authorization');
        if (!$token && input()->has('access_token')) {
            $token = "Bearer " . input()->get('access_token');
        }
        if ($token === null) {
            return null;
        }
        $fragments = explode(' ', $token);

        if (count($fragments) < 1) {
            return null;
        }
        return $fragments[1];
    });
}

/**
 * Get the current bearer token model
 * 
 * @return \Models\Token|null
 */
function getBearerModel()
{
    return cache()->store('bearerModel', function () {
        $token = getBearer();
        if (!$token) {
            return null;
        }

        $pdo = Token::getConnection();

        $query  = 'SELECT * FROM ' . (new Token())->getTable() . ' ';
        $query .= 'WHERE hash = :hash LIMIT 1;';

        $statement = $pdo->prepare($query);

        $statement->execute([':hash' => $token]);

        if ($statement->rowCount() === 0) {
            return null;
        }

        return Token::from($statement->fetchObject());
    });
}

/**
 * Filters elements in an array by its keys
 * 
 * @param array $array
 * @param string[] $keys
 * @return array
 */
function except($array, $keys)
{
    return array_filter($array, function ($key) use ($keys) {
        return !in_array($key, $keys);
    }, ARRAY_FILTER_USE_KEY);
}

/**
 * Gets elements in an array that is specified in the keys
 * 
 * @param array $array
 * @param string[] $keys
 * @return array
 */
function only($array, $keys)
{
    return array_filter($array, function ($key) use ($keys) {
        return in_array($key, $keys);
    }, ARRAY_FILTER_USE_KEY);
}

/**
 * Sets a header
 * 
 * @param string $key
 * @param string $value
 * @return void
 */
function setHeader($key, $value)
{
    header("{$key}: {$value}");
}

/**
 * Gets the header values
 * 
 * @param string[] $keys
 * @return string[]
 */
function getHeaders($keys = [])
{
    $headers = array();
    foreach ($_SERVER as $key => $value) {
        if (substr($key, 0, 5) <> 'HTTP_') {
            continue;
        }
        $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
        $headers[$header] = $value;
    }
    if (count($keys) > 0) {
        return only($headers, $keys);
    }
    return $headers;
}

/**
 * Gets a header or null if it does not exist
 * 
 * @param string $key
 * @param string|null $default
 * @return string|null
 */
function getHeader($key, $default = null)
{
    $headers = getHeaders();
    if (in_array($key, array_keys($headers))) {
        return $headers[$key];
    }

    return $default;
}

/**
 * Fetches a value from the configuration file
 * 
 * @param string|null $path
 * @return mixed
 */
function config($path = null)
{
    $configs = $_ENV['CONFIGS'];
    $value = null;
    if ($path === null) {
        return $configs;
    }
    foreach (explode('.', $path) as $key) {
        if ($value === null) {
            $value = $configs[$key];
        } else {
            $value = $value[$key];
        }
    }
    return $value;
}
