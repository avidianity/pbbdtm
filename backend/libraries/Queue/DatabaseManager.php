<?php

namespace Libraries\Queue;

use Interfaces\Queue\Manager;
use Interfaces\Queue\Queueable;
use Libraries\Log;
use Models\Queue;
use Throwable;
use Traits\Singleton;

class DatabaseManager implements Manager
{
    use Singleton;

    public function register(Queueable $queueable)
    {
        try {
            Queue::create(['payload' => serialize($queueable)]);
            return true;
        } catch (Throwable $exception) {
            throw $exception;
        }
    }

    public function work()
    {
        foreach (Queue::getAll() as $queue) {
            /**
             * @var Queueable
             */
            $queueable = unserialize($queue->payload);

            try {
                $class = get_class($queueable);
                echo "\nRunning: {$class} - {$queue->created_at}\n";
                $queueable->run();
                echo "\nDone: {$class} - {$queue->created_at}\n";
            } catch (Throwable $exception) {
                $queueable->report($exception);
                Log::record($exception);
            } finally {
                $queue->delete();
            }
        }
    }
}
