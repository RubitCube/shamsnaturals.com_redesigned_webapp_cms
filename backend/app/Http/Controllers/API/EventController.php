<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::where('is_published', true)
            ->orderBy('event_date', 'desc')
            ->paginate(10);

        // Automatically convert dates to client timezone (UAE) for display
        $events->getCollection()->transform(function ($event) {
            if ($event->event_date) {
                // Use the accessor to get client timezone
                $event->event_date = $event->event_date_client;
            }
            return $event;
        });

        return response()->json($events);
    }

    public function show($slug)
    {
        $event = Event::with('seo')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        // Automatically convert date to client timezone (UAE) for display
        if ($event->event_date) {
            $event->event_date = $event->event_date_client;
        }

        return response()->json($event);
    }
}

