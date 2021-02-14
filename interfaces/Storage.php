<?php

namespace Interfaces;

interface Storage extends Singleton
{
    /**
     * @return bool
     */
    public function put($path, $binary);

    /**
     * @return string|false
     */
    public function get($path);

    /**
     * @return bool
     */
    public function exists($path);

    /**
     * @return bool
     */
    public function delete($path);

    /**
     * @return string
     */
    public function getFullPath($path);
}
