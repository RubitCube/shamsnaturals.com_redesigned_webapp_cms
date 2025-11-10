<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'content',
        'featured_image',
        'event_date',
        'location',
        'is_published',
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'is_published' => 'boolean',
    ];

    public function seo()
    {
        return $this->morphOne(SeoMeta::class, 'metaable');
    }
}

