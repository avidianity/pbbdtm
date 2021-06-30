<?php

namespace Relations;

use Interfaces\HasRelationships;
use LogicException;
use Models\Model;

class MorphTo implements HasRelationships
{
    protected $morphable;

    /**
     * @var Model
     */
    protected $instance;

    public function __construct($morphable, Model &$instance)
    {
        $this->morphable = $morphable;
        $this->instance = $instance;
    }

    public function get()
    {
        $type = $this->morphable . '_type';
        $key = $this->morphable . '_id';

        $class = $this->instance->{$type};
        $id = $this->instance->{$key};

        return $class::find($id);
    }

    public function create($data)
    {
        throw new LogicException('Cannot create morphable.');
    }

    public function update($data)
    {
        if (!$this->has()) {
            throw new LogicException('Morphable does not exist.');
        }
        return $this->get()->update($data);
    }

    public function delete()
    {
        throw new LogicException('Cannot delete morphable.');
    }

    public function has(): bool
    {
        return $this->get() !== null;
    }
}
