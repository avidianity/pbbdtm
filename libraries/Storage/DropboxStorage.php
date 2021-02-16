<?php

namespace Libraries\Storage;

use Interfaces\Storage;
use Libraries\Log;
use Spatie\Dropbox\Client;
use Spatie\Dropbox\Exceptions\BadRequest;
use Traits\Singleton;

class DropboxStorage implements Storage
{
    use Singleton;

    protected $token;

    /**
     * @var Client
     */
    protected $client;

    public function __construct()
    {
        $this->token = config('storage.dropbox.token');
        $this->client = new Client($this->token);
    }

    public function put($path, $binary)
    {
        return $this->client->upload($path, $binary, 'overwrite') ? true : null;
    }

    public function get($path)
    {
        if (!$object = $this->readStream($path)) {
            return false;
        }

        $object['contents'] = stream_get_contents($object['stream']);
        fclose($object['stream']);
        unset($object['stream']);

        return $object['contents'];
    }

    protected function readStream($path)
    {
        $path = $this->getFullPath($path);

        try {
            $stream = $this->client->download($path);
        } catch (BadRequest $e) {
            Log::record($e);
            return false;
        }

        return compact('stream');
    }

    public function delete($path)
    {
        try {
            $this->client->delete($this->getFullPath($path));
        } catch (BadRequest $e) {
            Log::record($e);
            return false;
        }
        return true;
    }

    public function getFullPath($path)
    {
        return '/' . $path;
    }

    public function exists($path)
    {
        try {
            $this->client->getMetadata($this->getFullPath($path));
        } catch (BadRequest $e) {
            Log::record($e);
            return false;
        }
        return true;
    }
}
