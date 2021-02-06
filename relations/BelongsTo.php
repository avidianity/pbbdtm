<?php

namespace Relations;

use Interfaces\HasRelationships;
use LogicException;
use Models\Model;
use PDO;

class BelongsTo implements HasRelationships
{
    protected $parent;
    protected $foreignKey;
    protected $ownerKey;

    /**
     * @var Model
     */
    protected $instance;

    public function __construct($parent, $foreignKey = null, $ownerKey = 'id', Model &$instance)
    {
        $this->instance = $instance;
        $this->parent = $parent;
        $this->ownerKey = $ownerKey;
        $this->foreignKey = $foreignKey !== null
            ? $foreignKey
            : $this->qualifyForeignKey();
    }

    protected function qualifyForeignKey()
    {
        return $this->getParentTable() . '_id';
    }

    protected function getParentTable()
    {
        $parent = $this->parent;
        return (new $parent())->getTable();
    }

    public function get()
    {
        $pdo = Model::getConnection();

        $query  = 'SELECT * FROM ' . $this->getParentTable() . ' ';
        $query .= 'WHERE ' . $this->ownerKey . ' = :' . $this->ownerKey . ' ';
        $query .= 'LIMIT 1;';

        $statement = $pdo->prepare($query);

        $statement->execute([':' . $this->ownerKey => $this->instance->{$this->foreignKey}]);

        if ($statement->rowCount() === 0) {
            return null;
        }

        $class = $this->parent;

        return $class::from($statement->fetchObject());
    }

    public function create($data)
    {
        throw new LogicException('Child cannot create its parent.');
    }

    public function update($data)
    {
        return $this->get()->update($data);
    }

    public function delete()
    {
        throw new LogicException('Child cannot delete its parent.');
    }

    public function has(): bool
    {
        return true;
    }
}
