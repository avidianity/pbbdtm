<?php

namespace Interfaces;

interface Singleton
{
    /**
     * @return static
     */
    public static function getInstance();
}
