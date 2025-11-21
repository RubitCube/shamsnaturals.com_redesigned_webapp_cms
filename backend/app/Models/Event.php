<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

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

    /**
     * Automatically convert event_date to UTC when setting
     * The value is expected to be in admin timezone (Asia/Kolkata) from the admin panel
     */
    public function setEventDateAttribute($value)
    {
        if ($value) {
            // Parse the date and assume it's in admin timezone (Asia/Kolkata) if no timezone info
            // If it's already a Carbon instance or has timezone info, use that
            if (is_string($value)) {
                // Check if it's a datetime-local format (YYYY-MM-DD HH:mm:ss or YYYY-MM-DDTHH:mm)
                $value = str_replace('T', ' ', $value);
                if (!str_contains($value, ':')) {
                    $value .= ' 00:00:00';
                }
                // Parse as admin timezone and convert to UTC
                $this->attributes['event_date'] = Carbon::parse($value, config('timezone.admin', 'Asia/Kolkata'))
                    ->utc()
                    ->toDateTimeString();
            } else {
                // Already a Carbon instance or other format
                $this->attributes['event_date'] = Carbon::parse($value)->utc()->toDateTimeString();
            }
        } else {
            $this->attributes['event_date'] = $value;
        }
    }

    /**
     * Get event_date in client timezone (UAE) - for public API
     * Returns ISO 8601 format with timezone for proper JavaScript parsing
     */
    public function getEventDateClientAttribute()
    {
        if (!$this->event_date) {
            return null;
        }
        return Carbon::parse($this->event_date)
            ->setTimezone(config('timezone.client', 'Asia/Dubai'))
            ->format('Y-m-d\TH:i:sP'); // ISO 8601 with timezone offset
    }

    /**
     * Get event_date in admin timezone (India) - for admin API
     * Returns ISO 8601 format with timezone for proper JavaScript parsing
     */
    public function getEventDateAdminAttribute()
    {
        if (!$this->event_date) {
            return null;
        }
        return Carbon::parse($this->event_date)
            ->setTimezone(config('timezone.admin', 'Asia/Kolkata'))
            ->format('Y-m-d\TH:i:sP'); // ISO 8601 with timezone offset
    }

    public function seo()
    {
        return $this->morphOne(SeoMeta::class, 'metaable');
    }
}

