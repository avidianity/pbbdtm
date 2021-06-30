<?php

namespace Models;

/**
 * @property string $path
 * @property string $content
 */
class Storage extends Model
{
    protected $fillable = ['path', 'content'];
}
