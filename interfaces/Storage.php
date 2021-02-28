<?php

namespace Interfaces;

/**
 * Base interface for storage managers. Files are stored depending on the type of storage used.
 */
interface Storage extends Singleton
{
    /**
     * Write a binary into the storage system
     * 
     * @param string $path
     * @param string $binary
     * @return bool
     */
    public function put($path, $binary);

    /**
     * Get a file as binary
     * 
     * @param string $path
     * @return string|false
     */
    public function get($path);

    /**
     * Check if a file exists
     * 
     * @param string $path
     * @return bool
     */
    public function exists($path);

    /**
     * Delete a file
     * 
     * @param string $path
     * @return bool false if the file does not exist
     */
    public function delete($path);

    /**
     * Get the full path to the storage directory
     * 
     * @param string $path
     * @return string
     */
    public function getFullPath($path);
}
