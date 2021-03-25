<?php

namespace Controllers;

use Models\DocumentType;
use Models\DocumentTypeFile;
use Models\File;

class DocumentTypeController extends Controller
{
    public function __construct()
    {
        auth();
    }

    public function index()
    {
        return array_map(function (DocumentType $documentType) {
            foreach ($documentType->files as $file) {
                $file->load(['file']);
            }
            return $documentType;
        }, DocumentType::getAll());
    }

    public function show()
    {
        $id = input()->id;

        $documentType = DocumentType::findOrFail($id);

        foreach ($documentType->files as $file) {
            $file->load(['file']);
        }

        return $documentType;
    }

    public function store()
    {
        $data = input()->all();

        $pdo = DocumentType::getConnection();

        $query  = 'SELECT * FROM ' . (new DocumentType())->getTable() . ' ';
        $query .= 'WHERE ' . DocumentType::justifyKey('name') . ' = :name';

        $statement = $pdo->prepare($query);

        $name = input()->name;

        $statement->execute([':name' => $name]);

        if ($statement->rowCount() > 0) {
            return response(['message' => "{$name} already exists."], 400);
        }

        $documentType = DocumentType::create($data);

        if (input()->has('files')) {
            foreach (input()->file('files') as $file) {
                $model = File::process($file->fetch(), false);
                $model->name = $file->name;
                $model->save();
                DocumentTypeFile::create([
                    'document_type_id' => $documentType->id,
                    'file_id' => $model->id,
                ]);
            }
        }

        return $documentType;
    }

    public function update()
    {
        $id = input()->once('id');

        $documentType = DocumentType::findOrFail($id);

        $documentType->update(input()->all());

        if (input()->has('files')) {
            deleteMany($documentType->files, DocumentTypeFile::class);
            foreach (input()->file('files') as $file) {
                $model = File::process($file->fetch());
                $model->save();
                DocumentTypeFile::create([
                    'document_type_id' => $documentType->id,
                    'file_id' => $file->id,
                ]);
            }
        }

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
