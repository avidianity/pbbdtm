<?php

namespace Libraries;

use Exception;
use Exceptions\HTTPException;
use Interfaces\JSONable;
use Interfaces\Stringable;
use Models\Model;

/**
 * The base of the whole application
 */
class Application
{
    /**
     * @var \Libraries\Router
     */
    protected $router;

    /**
     * @var string
     */
    protected $url;

    /**
     * @var \Libraries\View
     */
    protected $view;

    public function __construct()
    {
        $this->enableCors();
    }

    public function setRouter($router)
    {
        $this->router = $router;
        return $this;
    }

    public function setUrl($url)
    {
        $this->url = $url;
        return $this;
    }

    public function setView($view)
    {
        $this->view = $view;
        return $this;
    }

    public function getView()
    {
        return $this->view;
    }

    /**
     * Start the application
     *
     * @return void
     */
    public function start()
    {
        try {
            // run the router against the parsed url
            $result = $this->router->run($this->url);

            // handle the results accordingly

            if ($result instanceof Response) {
                $result->send();
            } else if ($result instanceof View) {
                $this->setView($result);
                $result->render($this);
            } else if (is_string($result) || $result instanceof Stringable) {
                echo $result;
                return;
            } else if ($result instanceof Model) {
                $response = response($result);
                if ($result->isFresh()) {
                    $response->setStatus(201);
                }
                return $response->send();
            } else if (is_object($result) || is_array($result) || $result instanceof JSONable || $result instanceof Collection) {
                return response($result)->send();
            }
        } catch (Exception $exception) {
            // catch any error and display it properly

            if ($exception instanceof HTTPException) {
                $status = $exception->getStatus();

                if (getHeader('Accept') === 'application/json') {
                    return response($exception, $status, $exception->getHeaders())->send();
                }

                if (View::exists('errors.' . $status)) {
                    return view('errors.' . $status, ['exception' => $exception])
                        ->setStatus($status)
                        ->render($this);
                }

                return view('errors.500', ['exception' => $exception])
                    ->setStatus($status)
                    ->render($this);
            }

            if (getHeader('Accept') === 'application/json') {
                if ($exception instanceof Exception) {
                    $data = (array)json_decode(json_encode($exception));
                    $data['exception'] = get_class($exception);
                    $data['stacktrace'] = $exception->getTrace();
                    if (!in_array('message', array_keys($data))) {
                        $data['message'] = $exception->getMessage();
                    }
                    return response($data, 500)->send();
                }
                return response($exception, 500)->send();
            }

            return view('errors.500', ['exception' => $exception])
                ->setStatus(500)
                ->render($this);
        }
    }

    /**
     * Enable Cross-Origin-Resource-Sharing to enable communication to the frontend
     *
     * @return void
     * @link https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
     */
    public function enableCors()
    {
        if (isset($_SERVER['HTTP_ORIGIN'])) {
            header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Max-Age: 86400');
        }
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
                header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");

            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
                header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
        }
    }

    public function __get($name)
    {
        if ($this->view->hasData($name)) {
            return $this->view->getData($name);
        }

        return null;
    }
}
