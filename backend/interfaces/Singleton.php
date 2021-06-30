<?php

namespace Interfaces;

/**
 * Allows objects to have only one instance
 */
interface Singleton
{
    /**
     * The the current instance
     * 
     * @return static
     */
    public static function getInstance();
}
