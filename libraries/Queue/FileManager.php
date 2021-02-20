<?php

namespace Libraries\Queue;

use Interfaces\Queue\Manager;
use Interfaces\Queue\Queueable;
use Libraries\Log;
use Libraries\Str;
use Throwable;
use Traits\Singleton;

class FileManager implements Manager
{
    use Singleton;

    protected $dir;

    public function __construct()
    {
        $this->dir = config('queue.file.path');
    }

    protected function getPath()
    {
        return $this->dir;
    }

    public function register(Queueable $queueable)
    {
        $data = [
            'date' => date('F j, Y, g:i a'),
            'payload' => serialize($queueable),
        ];

        $name = concatenate($this->getPath(), Str::random(10), '.queue');

        return file_put_contents($name, json_encode($data)) !== false;
    }

    public function work()
    {
        $files = glob(concatenate($this->getPath(), '*.queue'));

        foreach ($files as $file) {
            if (file_exists($file)) {
                $data = (array)json_decode(file_get_contents($file));

                /**
                 * @var Queueable
                 */
                $queueable = unserialize($data['payload']);

                $class = get_class($queueable);
                echo "\nRunning: {$class} - {$data['date']}\n";

                try {
                    $queueable->run();
                    unlink($file);
                    return true;
                } catch (Throwable $e) {
                    $queueable->report($e);
                    Log::record($e);
                    return false;
                }
            }
        }
    }
}
