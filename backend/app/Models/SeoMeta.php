<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeoMeta extends Model
{
    use HasFactory;

    protected $fillable = [
        'metaable_type',
        'metaable_id',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_image',
        'image_seo',
    ];

    protected $casts = [
        'image_seo' => 'array',
    ];

    public function metaable()
    {
        return $this->morphTo();
    }
}

