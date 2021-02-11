<?php

namespace Controllers;

use Models\CMS;

class CMSController extends Controller
{
    public function index()
    {
        return CMS::getAll();
    }

    public function show()
    {
        $id = input()->once('id');

        return CMS::findOrFail($id);
    }

    public function store()
    {
        return CMS::create(input()->only(['key', 'value']));
    }

    public function update()
    {
        $id = input()->once('id');

        $cms = CMS::findOrFail($id);

        $cms->update(input()->only(['key', 'value']));

        return $cms;
    }

    public function destroy()
    {
        $id = input()->once('id');

        $cms = CMS::findOrFail($id);

        $cms->delete();

        return response('', 204);
    }
}
