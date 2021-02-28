<?php

namespace Interfaces;

/**
 * Base interface for handling relational data
 * @link https://en.wikipedia.org/wiki/Relational_database#RDBMS
 */
interface HasRelationships
{
    public function get();
    public function create($data);
    public function update($data);
    public function delete();
    public function has(): bool;
}
