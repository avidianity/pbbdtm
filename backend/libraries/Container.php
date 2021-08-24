<?php

namespace Libraries;

use ReflectionClass;
use ReflectionParameter;
use RuntimeException;

class Container
{
    protected $bindings = [];

    /**
     * Bind an abstract to the container
     *
     * @param string $abstract
     * @param callable $factory
     * @return static
     */
    public function set($abstract, callable $factory)
    {
        $this->bindings[$abstract] = $factory;

        return $this;
    }

    /**
     * Get an abstract from the container
     * 
     * @param string $abstract
     * @return mixed
     */
    public function get($abstract)
    {
        if (isset($this->bindings[$abstract])) {
            return $this->bindings[$abstract]($this);
        }

        if (!class_exists($abstract)) {
            throw new RuntimeException(sprintf('%s is not a class or an interface binding.', $abstract));
        }

        $reflection = new ReflectionClass($abstract);

        $dependencies = $this->buildDependencies($reflection);

        return $reflection->newInstanceArgs($dependencies->toArray());
    }

    /**
     * Build the dependencies of a class
     * 
     * @param \ReflectionClass $reflection
     * @return \Libraries\Collection<int, mixed>
     */
    protected function buildDependencies($reflection)
    {
        if (!$constructor = $reflection->getConstructor()) {
            return new Collection();
        }

        $params = new Collection($constructor->getParameters());

        $container = $this;

        return $params->map(function (ReflectionParameter $parameter) use ($container, $reflection) {
            if (!$type = $parameter->getType()) {
                throw new RuntimeException(sprintf('Unable to resolve %s', $reflection->getName()));
            }

            $class = $type->getName();

            if ((is_scalar($class) && !is_string($class)) || !class_exists($class)) {
                throw new RuntimeException(sprintf('%s is not a valid class', $class));
            }

            return $container->get($class);
        });
    }
}
