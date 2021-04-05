<?php

namespace Controllers;

use Models\Task;

class TaskController extends Controller
{
    /**
     * Get all records
     *
     * @return \Models\Task[]
     */
    public function index()
    {
        return Task::getAll();
    }

    /**
     * Get one record
     *
     * @return \Models\Task
     * @throws \Exceptions\NotFoundException if the record does not exist
     */
    public function show()
    {
        $id = input()->once('id');

        return Task::findOrFail($id);
    }

    /**
     * Store a record
     *
     * @return \Models\Task
     */
    public function store()
    {
        return Task::create(input()->only(['for', 'title', 'done', 'request_id', 'name']));
    }

    /**
     * Update a record
     *
     * @return \Models\Task
     * @throws \Exceptions\NotFoundException if the record does not exist
     */
    public function update()
    {
        $id = input()->once('id');

        $task = Task::findOrFail($id);

        $task->update(input()->only(['for', 'title', 'done', 'name']));

        return $task;
    }

    /**
     * Delete a record
     *
     * @return \Libraries\Response
     * @throws \Exceptions\NotFoundException if the record does not exist
     */
    public function destroy()
    {
        $id = input()->once('id');

        $task = Task::findOrFail($id);

        $task->delete();

        return response('', 204);
    }
}
