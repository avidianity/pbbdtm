<?php

namespace Controllers;

use Models\Log;

class LogController extends Controller
{
    public function __invoke()
    {
        return array_map(function (Log $log) {
            $log->load(['user', 'loggable']);

            if (method_exists($log->loggable, 'documentType')) {
                $log->loggable->load(['documentType']);
            }

            return $log;
        }, Log::getAll());
    }
}
