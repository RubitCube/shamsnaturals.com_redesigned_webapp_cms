<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::orderBy('event_date', 'desc')->paginate(20);
        
        // Automatically convert dates to admin timezone for display
        $events->getCollection()->transform(function ($event) {
            if ($event->event_date) {
                // Use the accessor to get admin timezone
                $event->event_date = $event->event_date_admin;
            }
            return $event;
        });
        
        return response()->json($events);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'required|string',
            'featured_image' => 'nullable|image|max:2048',
            'event_date' => 'required|date',
            'location' => 'nullable|string|max:255',
            'is_published' => 'nullable',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        if ($request->hasFile('featured_image')) {
            $validated['featured_image'] = $request->file('featured_image')->store('events', 'public');
        }

        if ($request->has('is_published')) {
            $validated['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN);
        }

        // The model's setEventDateAttribute mutator will automatically convert to UTC
        $event = Event::create($validated);
        
        // Automatically convert back to admin timezone for response
        if ($event->event_date) {
            $event->event_date = $event->event_date_admin;
        }

        return response()->json($event, 201);
    }

    public function show($id)
    {
        $event = Event::with('seo')->findOrFail($id);
        
        // Automatically convert date to admin timezone for display
        if ($event->event_date) {
            $event->event_date = $event->event_date_admin;
        }
        
        return response()->json($event);
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'required|string',
            'featured_image' => 'nullable|image|max:2048',
            'event_date' => 'required|date',
            'location' => 'nullable|string|max:255',
            'is_published' => 'nullable',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        if ($request->hasFile('featured_image')) {
            if ($event->featured_image) {
                Storage::disk('public')->delete($event->featured_image);
            }
            $validated['featured_image'] = $request->file('featured_image')->store('events', 'public');
        }

        if ($request->has('is_published')) {
            $validated['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN);
        }

        // The model's setEventDateAttribute mutator will automatically convert to UTC
        $event->update($validated);
        
        // Automatically convert back to admin timezone for response
        if ($event->event_date) {
            $event->event_date = $event->event_date_admin;
        }

        return response()->json($event);
    }

    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        
        if ($event->featured_image) {
            Storage::disk('public')->delete($event->featured_image);
        }
        
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully']);
    }
}

