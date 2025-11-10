<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::orderBy('event_date', 'desc')->paginate(20);
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

        $event = Event::create($validated);

        return response()->json($event, 201);
    }

    public function show($id)
    {
        $event = Event::with('seo')->findOrFail($id);
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

        $event->update($validated);

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

