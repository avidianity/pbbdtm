<?php

namespace Libraries;

use PDO;
use Traits\Singleton;

class Database extends PDO
{
    use Singleton;
}
