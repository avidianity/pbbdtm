<?php

namespace Controllers;

use Models\DocumentType;

class DocumentTypeController extends Controller
{
    public function __construct()
    {
        auth();
    }

    public function index()
    {
        return DocumentType::getAll();
    }

    public function show()
    {
        $id = input()->id;

        $documentType = DocumentType::findOrFail($id);

        return $documentType;
    }

    public function store()
    {
        return DocumentType::create(input()->all());
    }

    public function update()
    {
        $id = input()->once('id');

        $documentType = DocumentType::findOrFail($id);

        $documentType->update(input()->all());

        return $documentType;
    }

    public function destroy()
    {
        $id = input()->once('id');

        $documentType = DocumentType::findOrFail($id);

        $documentType->delete();

        return response('', 204);
    }
}
