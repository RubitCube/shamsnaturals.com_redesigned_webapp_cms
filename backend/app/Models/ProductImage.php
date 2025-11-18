<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'image_path',
        'alt_text',
        'order',
        'is_primary',
    ];

    protected $appends = [
        'image_url',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) {
            return null;
        }

        // Storage::url() returns /storage/path, we need to build full URL
        $relativePath = '/storage/' . ltrim($this->image_path, '/');

        // Try to get from request first (includes port)
        if (request()->hasHeader('Host')) {
            $host = request()->getScheme() . '://' . request()->getHttpHost();
            return $host . $relativePath;
        }

        // Fallback to config, but ensure port 8000 for localhost
        $appUrl = config('app.url', 'http://localhost');
        if (str_contains($appUrl, 'localhost') && !str_contains($appUrl, ':')) {
            $appUrl = 'http://localhost:8000';
        }

        return rtrim($appUrl, '/') . $relativePath;
    }
}

