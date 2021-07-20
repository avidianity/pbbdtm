<?php

namespace Libraries\Queue;

use Interfaces\Queue\Manager;
use Interfaces\Queue\Queueable;
use Libraries\Log;
use Throwable;
use Traits\Singleton;

class SyncManager implements Manager
{
    use Singleton;

    public function register(Queueable $queueable)
    {
        try {
            $queueable->run();
            return true;
        } catch (Throwable $e) {
            $queueable->report($e);
            Log::record($e);
            return false;
        }
    }

    public function work()
    {
        echo "\nNo Queues to run. Exiting...\n";
        exit;
    }
}
