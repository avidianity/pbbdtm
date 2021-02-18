<?php

namespace Libraries\Queue;

use Interfaces\Queue\Manager as QueueManager;
use Interfaces\Queue\Queueable;
use Libraries\Str;
use Traits\Singleton;

class FileManager implements QueueManager
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

                $queueable->run();

                unlink($file);
            }
        }
    }
}
