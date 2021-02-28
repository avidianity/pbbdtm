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

    public function query($statement, $mode = PDO::ATTR_DEFAULT_FETCH_MODE, $arg3 = null, array $ctoargs = array())
    {
        $args = func_get_args();
        Log::record($args[0]);
        return parent::query(...$args);
    }
}
