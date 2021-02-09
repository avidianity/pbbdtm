<?php

namespace Libraries;

use Exception;
use PDO;
use Traits\Singleton;

class Database extends PDO
{
    use Singleton;

    public function prepare($statement, $options = [])
    {
        $this->logQuery($statement);
        return parent::prepare($statement, $options);
    }

    protected function logQuery($query)
    {
        $path = config('logs.path') . 'avidian.log';
        $logs = file_get_contents($path);
        $logs .= '[' . date('F j, Y, g:i a') . ']' . ' | ' . $query . ' | ' . "\n";
        file_put_contents($path, $logs);
    }
}
