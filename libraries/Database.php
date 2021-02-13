<?php

namespace Libraries;

use Exception;
use PDO;
use Traits\Singleton;

class Database extends PDO
{
    use Singleton;

    public function prepare($statement, $options = [], $data = [])
    {
        $this->logQuery($statement, $data);
        return parent::prepare($statement, $options);
    }

    protected function logQuery($query, $data)
    {
        $path = config('logs.path') . 'avidian.log';
        $logs = file_get_contents($path);
        $logs .= '[' . date('F j, Y, g:i a') . ']' . ' | ' . $query . ' | Data - ' . json_encode($data) . "\n";
        file_put_contents($path, $logs);
    }
}
