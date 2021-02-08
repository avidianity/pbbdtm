<?php

namespace Models;

use Exceptions\NotFoundException;
use Interfaces\Arrayable;
use Interfaces\HasRelationships;
use Interfaces\JSONable;
use InvalidArgumentException;
use Libraries\Database;
use LogicException;
use stdClass;
use Traits\HasEvents;
use Traits\HasRelations;

abstract class Model implements JSONable, Arrayable
{
    use HasRelations, HasEvents;

    /**
     * Attributes that are serialized
     * 
     * @var array
     */
    protected $casts = [];

    /**
     * Current data associated with this model
     * 
     * @var array
     */
    protected $data = [];

    /**
     * Properties that can be mass-assigned
     * 
     * @var array
     */
    protected $fillable = [];

    /**
     * Properties that should be hidden when serialized.
     * 
     * @var array
     */
    protected $hidden = [];

    /**
     * The model's table name. It will be inferred if its null
     * 
     * @var null|string
     */
    protected static $table = null;

    /**
     * Current database connection used
     * @var \Libraries\Database
     */
    protected static $pdo = null;

    /**
     * Indicates if model is newly created
     * @var bool
     */
    protected $fresh = false;

    /**
     * Create a new instance of the model and fill any data if any
     * 
     * @param mixed $data
     */
    public function __construct($data = null)
    {
        if ($data !== null) {
            $this->fill($data);
        }
        $this->events();
    }

    /**
     * Magically set a value into the data
     * 
     * @param string $key
     * @param mixed $value
     * @return void
     */
    public function __set($key, $value)
    {
        $this->data[$key] = $value;
    }

    /**
     * Magically get a value from the data
     * 
     * @param string $key
     * @return mixed
     */
    public function __get($key)
    {
        if (in_array($key, array_keys($this->data))) {
            return $this->data[$key];
        }
        if (method_exists($this, $key)) {
            $result = $this->{$key}();
            if ($result instanceof HasRelationships) {
                $this->load([$key]);
                return $this->relationships[$key];
            }
        }
        return null;
    }

    /**
     * Cast value if any cast exists
     * 
     * @param string $key
     * @param string $value
     * @param string $type
     */
    protected function cast($key, $value, $type)
    {
        //
    }

    /**
     * Mass-assign values into the the data
     * 
     * @param mixed|array $data
     * @return static
     */
    public function fill($data)
    {
        return $this->forceFill(only($data, $this->fillable));
    }

    /**
     * Force mass-assign values by ignoring the fillable array
     * 
     * @param mixed|array $data
     * @return static
     */
    public function forceFill($data)
    {
        foreach ($data as $key => $value) {
            $this->data[$key] = $value;
        }
        return $this;
    }

    /**
     * Get the model's table name
     * 
     * @return string
     */
    public function getTable()
    {
        if (static::$table !== null) {
            return static::$table;
        }
        $split = explode('\\', get_class($this));
        return strtolower($split[count($split) - 1]);
    }

    /**
     * Serialize the model's data into an object
     * 
     * @return object
     */
    public function toJSON(): object
    {
        $object = new stdClass();

        $data = $this->toArray();

        $dates = [];

        if (in_array('created_at', array_keys($data))) {
            $dates['created_at'] = $data['created_at'];
            unset($data['created_at']);
        }

        if (in_array('updated_at', array_keys($data))) {
            $dates['updated_at'] = $data['updated_at'];
            unset($data['updated_at']);
        }

        foreach ($data as $property => $value) {
            $object->{$property} = $value;
        }

        foreach ($dates as $key => $value) {
            $object->{$key} = $value;
        }

        return $object;
    }

    /**
     * Serialize the model's data into an array
     * 
     * @return array
     */
    public function toArray(): array
    {
        $data = except($this->data, $this->hidden);

        foreach ($this->relationships as $relation => $instance) {
            $data[$relation] = $instance;
        }

        return $data;
    }

    /**
     * Set the current connection
     * 
     * @param \Libraries\Database $pdo
     * @return void
     */
    public static function setConnection($pdo)
    {
        static::$pdo = $pdo;
    }

    /**
     * Get the current connection
     * 
     * @return \Libraries\Database;
     */
    public static function getConnection(): Database
    {
        return static::$pdo;
    }

    /**
     * Get raw data of the current instance
     * 
     * @return mixed
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Create a new entry in the database
     * 
     * @param mixed $data
     * @return static
     */
    public static function create($data)
    {
        $instance = new static($data);
        $instance
            ->fireEvent('creating')
            ->fireEvent('saving');

        $data = $instance->getData();

        $table = $instance->getTable();

        $query  = 'INSERT INTO ' . $table . ' (';
        $query .= implode(', ', array_keys($data)) . ') VALUES (';
        $query .= implode(', ', array_map(function ($key) {
            return ':' . $key;
        }, array_keys($data))) . ');';

        $statement = static::$pdo->prepare($query);

        $inputs = [];

        foreach ($data as $key => $value) {
            $inputs[":{$key}"] = $value;
        }

        $statement->execute($inputs);

        $id = static::$pdo->lastInsertId();


        $instance
            ->fireEvent('created')
            ->fireEvent('saved');

        return static::find($id)->setFresh(true);
    }

    /**
     * Update current entry to the database
     * 
     * @param mixed $data
     * @return static
     */
    public function update($data = [])
    {
        $this
            ->fireEvent('updating')
            ->fireEvent('saving');
        $this->fill($data);

        $data = $this->data;
        unset($data['id']);
        unset($data['created_at']);
        unset($data['updated_at']);

        $table = $this->getTable();

        $query  = 'UPDATE ' . $table . ' SET ';

        $params = [];

        foreach (array_keys($data) as $key) {
            $params[] = $key . ' = :' . $key;
        }

        $query .= implode(', ', $params) . ' ';

        $query .= 'WHERE id = :id;';

        $statement = static::$pdo->prepare($query);

        $inputs = [
            ':id' => $this->id,
        ];

        foreach ($data as $key => $value) {
            $inputs[":{$key}"] = $value;
        }

        $statement->execute($inputs);

        $instance = static::find($this->id);

        $this->forceFill($instance->getData());

        $this
            ->fireEvent('updated')
            ->fireEvent('saved');

        return $instance;
    }

    /**
     * Save the current instance into the database
     * 
     * @return static
     */
    public function save()
    {
        if (in_array('id', array_keys($this->data))) {
            return $this->update();
        }
        $instance = static::create($this->data);
        return $this->forceFill($instance->getData());
    }

    /**
     * Deletes the current instance from the database
     * 
     * @return static
     */
    public function delete()
    {
        $this->fireEvent('deleting');

        $statement = static::$pdo->prepare('DELETE FROM ' . $this->getTable() . ' WHERE id = :id;');

        $statement->execute([':id' => $this->id]);

        $this->fireEvent('deleted');

        return $this;
    }

    /**
     * Deletes the instances or ids from the database
     * 
     * @param array|static[] $ids
     * @return void
     */
    public static function deleteMany($ids = [])
    {
        if (count($ids) === 0) {
            return;
        }
        $ids = array_map(function ($entry) {
            if ($entry instanceof static) {
                return $entry->id;
            }
            return $entry;
        }, $ids);

        $instances = static::find($ids);

        foreach ($instances as $instance) {
            $instance->fireEvent('deleting');
        }

        $query = 'DELETE FROM ' . (new static())->getTable() . ' WHERE id IN(' . implode(', ', array_map(function () {
            return '?';
        }, $ids)) . ');';
        $statement = static::$pdo->prepare($query);

        $statement->execute($ids);

        foreach ($instances as $instance) {
            $instance->fireEvent('deleted');
        }
    }

    /**
     * Gets all rows from the database
     * 
     * @return static[]
     */
    public static function getAll()
    {
        $statement = static::$pdo->query('SELECT * FROM ' . (new static())->getTable() . ';');

        return array_map(function ($row) {
            $instance = static::from($row);
            return $instance;
        }, $statement->fetchAll(Database::FETCH_ASSOC));
    }

    /**
     * Finds an id or ids in the database
     * 
     * @param int|int[] $ids
     * @return static|static[]|null
     */
    public static function find($ids = [])
    {
        if (is_array($ids) && count($ids) === 0) {
            return [];
        }
        $single = false;
        if (!is_array($ids)) {
            $single = true;
            $ids = [$ids];
        }

        $query  = 'SELECT * FROM ' . (new static())->getTable() . ' ';
        $query .= 'WHERE id IN (' . implode(', ', array_map(function () {
            return '?';
        }, $ids)) . ');';

        $statement = static::$pdo->prepare($query);

        $statement->execute($ids);

        if ($statement->rowCount() === 0 && $single) {
            return null;
        }

        $result = $statement->fetchAll(Database::FETCH_ASSOC);

        if ($single) {
            return static::from($result[0]);
        }
        return array_map(function ($row) {
            return static::from($row);
        }, $result);
    }

    /**
     * Finds an id or ids in the database
     * 
     * @param int|int[] $ids
     * @return static|static[]
     * @throws \Exceptions\NotFoundException if it does not exist
     */
    public static function findOrFail($ids)
    {
        $results = static::find($ids);

        if ($results === null || (is_array($results) && count($results) === 0)) {
            throw new NotFoundException('Model does not exist.');
        }

        return $results;
    }

    /**
     * Make a new instance from a database row
     * 
     * @param mixed $data
     * @return static
     */
    public static function from($data)
    {
        return (new static())->forceFill($data);
    }

    /**
     * Specify data which should be encoded into JSON
     * 
     * @return object
     */
    public function jsonSerialize()
    {
        $this->fireEvent('serializing');
        return $this->toJSON();
    }

    /**
     * Check if model is fresh
     * 
     * @return bool
     */
    public function isFresh()
    {
        return $this->fresh;
    }

    /**
     * Indicate current freshness of instance
     * 
     * @return static
     */
    public function setFresh($fresh)
    {
        $this->fresh = $fresh;

        return $this;
    }
}
