<?php

namespace Libraries;

use Interfaces\Singleton as SingletonContract;
use PDO;
use Traits\Singleton;

class Database extends PDO implements SingletonContract
{
    use Singleton;

    public function prepare($statement, $options = [], $data = [])
    {
        Log::record($statement, $data);
        return parent::prepare($statement, $options);
    }

    public function query()
    {
        $args = func_get_args();
        Log::record($args[0]);
        return parent::query(...$args);
    }
}
