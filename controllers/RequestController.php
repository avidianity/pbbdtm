<?php

namespace Controllers;

use Models\File;
use Models\Request;

class RequestController extends Controller
{
    public function __construct()
    {
        auth();
    }

    public function index()
    {
        return array_map(function (Request $request) {
            return $request->load(['user', 'documentType', 'file']);
        }, Request::getAll());
    }

    public function show()
    {
        $id = input()->id;

        $request = Request::findOrFail($id);

        $request->load(['user', 'documentType', 'file']);

        return $request;
    }

    public function store()
    {
        return Request::create(input()->all());
    }

    public function update()
    {
        $id = input()->once('id');

        $request = Request::findOrFail($id);

        if (input()->has('file')) {
            $raw = input()->file;
            $file = File::process($raw);

            $file->save();

            if ($request->file !== null) {
                $request->file->delete();
            }

            $request->file_id = $file->id;
        }

        $request->update(input()->all());

        return $request;
    }

    public function destroy()
    {
        $id = input()->once('id');

        $request = Request::findOrFail($id);

        $request->delete();

        return response('', 204);
    }
}
