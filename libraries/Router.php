<?php

namespace Libraries;

use Traits\Singleton;
use Closure;
use Controllers\Controller;
use Exception;
use Exceptions\NotFoundException;
use InvalidArgumentException;

/**
 * Used to bind url routes with their proper handlers.
 */
class Router
{
    use Singleton;

    protected static $routes = [];
    protected $prefix = null;
    protected $fallback = null;

    /**
     * Registers a route
     * 
     * @param string $uri
     * @param \Closure|string $handle
     * @param string $method
     * @return static
     */
    protected function register($uri, $handle, $method)
    {
        static::$routes[] = [
            'uri' => $this->prefix . $uri,
            'handle' => $handle,
            'method' => $method,
        ];
        return $this;
    }

    /**
     * Registers a GET route
     * 
     * @param string $uri
     * @param \Closure|string $handle
     * @return static
     */
    public function get($uri, $handle)
    {
        return $this->register($uri, $handle, 'get');
    }

    /**
     * Registers a POST route
     * 
     * @param string $uri
     * @param \Closure|string $handle
     * @return static
     */
    public function post($uri, $handle)
    {
        return $this->register($uri, $handle, 'post');
    }

    /**
     * Registers a PUT route
     * 
     * @param string $uri
     * @param \Closure|string $handle
     * @return static
     */
    public function put($uri, $handle)
    {
        return $this->register($uri, $handle, 'put');
    }

    /**
     * Registers a PATCH route
     * 
     * @param string $uri
     * @param \Closure|string $handle
     * @return static
     */
    public function patch($uri, $handle)
    {
        return $this->register($uri, $handle, 'patch');
    }

    /**
     * Registers a DELETE route
     * 
     * @param string $uri
     * @param \Closure|string $handle
     * @return static
     */
    public function delete($uri, $handle)
    {
        return $this->register($uri, $handle, 'delete');
    }

    /**
     * Groups routes with a prefix
     * 
     * @param string $prefix
     * @param \Closure $callable
     * @return static
     */
    public function group($prefix, $callable)
    {
        $last = $this->prefix;
        $this->prefix = $this->prefix !== null
            ? $this->prefix . $prefix
            : $prefix;
        $callable($this);
        $this->prefix = $last;
        return $this;
    }

    /**
     * Tests the givel url against the registered routes
     * 
     * @param string $url
     * @return Response|View|mixed
     * @throws \Exceptions\NotFoundException
     */
    public function run($url)
    {
        $requestMethod = strtolower($_SERVER['REQUEST_METHOD']);

        foreach (static::$routes as $route) {
            if ($this->urlMatches($route['uri'], $url) && $requestMethod === $route['method']) {
                if ($route['handle'] instanceof Closure) {
                    return $route['handle']();
                }

                if (is_string($route['handle']) && is_subclass_of($route['handle'], Controller::class)) {
                    $handle = $route['handle'];
                    $controller = new $handle();
                    if (is_callable($controller)) {
                        return $controller();
                    }
                }

                if (is_array($route['handle'])) {
                    $handle = $route['handle'];
                    if (!class_exists($handle[0])) {
                        throw new InvalidArgumentException('Handle must be a class of controller if array is supplied or the controller does not exist.');
                    }
                    $class = $handle[0];
                    $controller = new $class();
                    if (!method_exists($controller, $handle[1])) {
                        throw new Exception($handle[1] . ' does not exist on ' . $handle[0]);
                    }
                    $method = $handle[1];
                    return $controller->{$method}();
                }
            }
        }

        if ($requestMethod === 'options') {
            return response('', 200);
        }

        if ($this->fallback !== null) {
            $fallback = $this->fallback;
            if ($fallback instanceof Closure) {
                return $fallback();
            }
            if (is_subclass_of($fallback, Controller::class)) {
                $controller = new $fallback();
                if (is_callable($controller)) {
                    return $controller();
                }
            }
            if (is_array($fallback)) {
                $handle = $fallback;
                if (!class_exists($handle[0])) {
                    throw new InvalidArgumentException('Handle must be a class of controller if array is supplied or the controller does not exist.');
                }
                $class = $handle[0];
                $controller = new $class();
                if (!method_exists($controller, $handle[1])) {
                    throw new Exception($handle[1] . ' does not exist on ' . $handle[0]);
                }
                $method = $handle[1];
                return $controller->{$method}();
            }
        }

        throw new NotFoundException();
    }

    public function fallback($fallback)
    {
        $this->fallback = $fallback;
        return $this;
    }

    public function apiResource($path, $class)
    {
        $this->get($path, [$class, 'index']);
        $this->get($path . '/show', [$class, 'show']);
        $this->post($path, [$class, 'store']);
        $this->put($path, [$class, 'update']);
        $this->patch($path, [$class, 'update']);
        $this->delete($path, [$class, 'destroy']);
        return $this;
    }

    public function apiResources($resources)
    {
        foreach ($resources as $path => $class) {
            $this->apiResource($path, $class);
        }
        return $this;
    }

    public static function getAll()
    {
        return static::$routes;
    }

    protected function urlMatches($uri, $url)
    {
        return $uri === $url || $uri === ($url . '/');
    }
}
