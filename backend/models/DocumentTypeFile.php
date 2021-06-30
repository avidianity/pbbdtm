<?php

namespace Models;

class DocumentTypeFile extends Model
{
    protected static $table = 'document_type_file';
    protected $fillable = ['file_id', 'document_type_id'];

    protected static function events()
    {
        static::deleted(function (self $type) {
            $type->file->delete();
        });
    }

    public function file()
    {
        return $this->belongsTo(File::class);
    }

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }
}
