<?php

namespace Controllers;

use Models\CMS;

/**
 * Responsible for managing content that is displayed to the end user
 */
class CMSController extends Controller
{
    /**
     * Get all records
     *
     * @return \Models\CMS[]
     */
    public function index()
    {
        return CMS::getAll();
    }

    /**
     * Get one record
     *
     * @return \Models\CMS
     * @throws \Exceptions\NotFoundException if the record does not exist
     */
    public function show()
    {
        $id = input()->once('id');

        return CMS::findOrFail($id);
    }

    /**
     * Store a record
     *
     * @return \Models\CMS
     */
    public function store()
    {
        return CMS::create(input()->only(['key', 'value']));
    }

    /**
     * Update a record
     *
     * @return \Models\CMS
     * @throws \Exceptions\NotFoundException if the record does not exist
     */
    public function update()
    {
        $id = input()->once('id');

        $cms = CMS::findOrFail($id);

        $cms->update(input()->only(['key', 'value']));

        return $cms;
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

        $cms = CMS::findOrFail($id);

        $cms->delete();

        return response('', 204);
    }
}
