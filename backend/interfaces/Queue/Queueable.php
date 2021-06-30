<?php

namespace Interfaces\Queue;

use Interfaces\Serializable;
use Throwable;

/**
 * Base interface for queueable jobs to be run in the background
 */
interface Queueable extends Serializable
{
    /**
     * Run the job
     *
     * @return void
     */
    public function run();

    /**
     * Reports the exception if the job was not successful
     *
     * @param \Throwable $exception
     * @return void
     */
    public function report(Throwable $exception): void;
}
