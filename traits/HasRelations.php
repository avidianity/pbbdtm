<?php

namespace Traits;

use Interfaces\HasRelationships;
use InvalidArgumentException;
use LogicException;
use Relations\BelongsTo;
use Relations\HasMany;
use Relations\HasOne;

trait HasRelations
{
    protected $relationships = [];

    public function hasMany($class, $foreignKey = null, $ownerKey = 'id')
    {
        return new HasMany($class, $foreignKey, $ownerKey, $this);
    }

    public function hasOne($class, $foreignKey = null, $ownerKey = 'id')
    {
        return new HasOne($class, $foreignKey, $ownerKey, $this);
    }

    public function belongsTo($class, $foreignKey = null, $ownerKey = 'id')
    {
        return new BelongsTo($class, $foreignKey, $ownerKey, $this);
    }

    /**
     * Load a set of relations
     * 
     * @param string[] $relations
     * @return static
     */
    public function load($relations)
    {
        foreach ($relations as $relation) {
            if (!method_exists($this, $relation)) {
                throw new LogicException("{$relation} is not a set relationship of type " . static::class);
            }

            $instance = $this->{$relation}();

            if (!($instance instanceof HasRelationships)) {
                throw new InvalidArgumentException("{$relation} is not a relation");
            }

            $this->relationships[$relation] = $instance->get();
        }
        return $this;
    }
}
