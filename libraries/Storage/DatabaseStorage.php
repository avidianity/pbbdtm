<?php

namespace Libraries\Storage;

use Exception;
use Interfaces\Storage;
use Models\Storage as StorageModel;
use Traits\Singleton;

class DatabaseStorage implements Storage
{
    use Singleton;

    public function put($path, $binary)
    {
        $fullPath = $this->getFullPath($path);

        try {
            StorageModel::create(['path' => $fullPath, 'content' => base64_encode($binary)]);

            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    public function get($path)
    {
        try {
            $pdo = StorageModel::getConnection();
            $path = $this->getFullPath($path);
            $query  = 'SELECT * FROM ' . (new StorageModel())->getTable() . ' ';
            $query .= 'WHERE ' . StorageModel::justifyKey('path') . ' = :path LIMIT 1;';

            $statement = $pdo->prepare($query);

            $statement->execute([':path' => $path]);

            if ($statement->rowCount() === 0) {
                return false;
            }

            return base64_decode(StorageModel::from($statement->fetch())->content);
        } catch (Exception $e) {
            return false;
        }
    }

    public function delete($path)
    {
        try {
            $pdo = StorageModel::getConnection();
            $path = $this->getFullPath($path);
            $query  = 'SELECT * FROM ' . (new StorageModel())->getTable() . ' ';
            $query .= 'WHERE ' . StorageModel::justifyKey('path') . ' = :path LIMIT 1;';

            $statement = $pdo->prepare($query);

            $statement->execute([':path' => $path]);

            if ($statement->rowCount() === 0) {
                return false;
            }

            StorageModel::from($statement->fetch())->delete();

            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    public function getFullPath($path)
    {
        return $path;
    }

    public function exists($path)
    {
        try {
            $pdo = StorageModel::getConnection();
            $path = $this->getFullPath($path);
            $query  = 'SELECT * FROM ' . (new StorageModel())->getTable() . ' ';
            $query .= 'WHERE ' . StorageModel::justifyKey('path') . ' = :path LIMIT 1;';

            $statement = $pdo->prepare($query);

            $statement->execute([':path' => $path]);

            if ($statement->rowCount() === 0) {
                return false;
            }

            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
