<?php

namespace Controllers;

use Models\File;

class FileController extends Controller
{
    public function stream()
    {
        $id = input()->once('id');

        $file = File::findOrFail($id);

        $headers = [
            'Content-Type' => $file->type,
            'Content-Size' => $file->size,
        ];

        if (input()->has('download') && input()->download === 'true') {
            $headers['Content-Disposition'] = "attachment; filename=\"{$file->name}\"";
        }

        return response(storage()->get($file->path), 200, $headers);
    }
}
