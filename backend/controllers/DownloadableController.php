<?php

namespace Controllers;

use Models\Downloadable;
use Models\File;
use Models\User;

class DownloadableController extends Controller
{
    protected function admin()
    {
        auth(function (User $user) {
            return $user->isAdmin();
        });
    }

    public function index()
    {
        return array_map(function (Downloadable $downloadable) {
            $downloadable->load(['file']);

            return $downloadable;
        }, Downloadable::getAll());
    }

    public function show()
    {
        $id = input()->once('id');

        $downloadable = Downloadable::findOrFail($id);

        $downloadable->load(['file']);

        return $downloadable;
    }

    public function store()
    {
        $data = input()->all();

        $file = File::process($data['file']);

        $file->save();

        $data['file_id'] = $file->id;

        $downloadable = Downloadable::create($data);

        $downloadable->load(['file']);

        return $downloadable;
    }

    public function update()
    {
        $id = input()->once('id');

        $downloadable = Downloadable::findOrFail($id);

        $downloadable->load(['file']);

        $data = input()->only(['name', 'file', 'category']);

        if (input()->has('file')) {
            $downloadable->file->delete();

            $file = File::process($data['file']);

            $file->save();

            $data['file_id'] = $file->id;
        }

        $downloadable->update($data);

        $downloadable->load(['file']);

        return $downloadable;
    }

    public function destroy()
    {
        $id = input()->once('id');

        $downloadable = Downloadable::findOrFail($id);

        $downloadable->delete();

        return response('', 204);
    }
}
