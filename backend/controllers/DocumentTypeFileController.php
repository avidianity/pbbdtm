<?php

namespace Controllers;

use Models\DocumentTypeFile;

class DocumentTypeFileController extends Controller
{
    public function destroy()
    {
        $id = input()->once('id');

        $documentTypeFile = DocumentTypeFile::findOrFail($id);

        $documentTypeFile->delete();

        return response('', 204);
    }
}
