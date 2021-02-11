<?php

namespace Controllers;

use Models\Log;
use Models\Request;
use Models\User;

class StatisticsController extends Controller
{
    public function __invoke()
    {
        $requests = Request::getAll();
        $logs = Log::getAll();
        return [
            'users' => User::count(),
            'logs' => Log::count(),
            'approved_requests' => count(array_filter($requests, function (Request $request) {
                return $request->status === 'Released';
            })),
            'pending_requests' => count(array_filter($requests, function (Request $request) {
                return $request->status !== 'Released' || $request->status !== 'Rejected';
            })),
            'last_log' => count($logs) > 0 ? $logs[count($logs) - 1] : null
        ];
    }
}
