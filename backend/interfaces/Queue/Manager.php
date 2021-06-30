<?php

namespace Interfaces\Queue;

use Interfaces\Singleton;

/**
 * Base interface for queue managers
 */
interface Manager extends Singleton
{
    /**
     * Register a queue
     *
     * @param \Interfaces\Queue\Queueable $queueable
     * @return void
     */
    public function register(Queueable $queueable);

    /**
     * Work the pending queues and run them
     *
     * @return void
     */
    public function work();
}
