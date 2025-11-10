<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::where('is_published', true)
            ->orderBy('event_date', 'desc')
            ->paginate(10);

        return response()->json($events);
    }

    public function show($slug)
    {
        $event = Event::with('seo')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json($event);
    }
}

