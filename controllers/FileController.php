<?php

namespace Controllers;

use Libraries\Storage;
use Models\File;

class FileController extends Controller
{
    public function stream()
    {
        $id = input()->once('id');

        $file = File::findOrFail($id);

        return response(Storage::get($file->path), 200, [
            'Content-Type' => $file->type,
            'Content-Size' => $file->size,
        ]);
    }
}
