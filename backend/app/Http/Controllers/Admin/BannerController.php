<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::orderBy('order')->get();
        return response()->json($banners);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'required|image|max:5120',
            'link' => 'nullable|url',
            'page' => 'nullable|string|in:homepage,about,new-arrivals,dealers,contact',
            'order' => 'nullable|integer',
            'is_active' => 'nullable',
        ]);

        $validated['image_path'] = $request->file('image')->store('banners', 'public');
        $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        
        // Ensure page field is set correctly
        if ($request->has('page')) {
            $validated['page'] = $request->input('page') ?: null;
        }

        $banner = Banner::create($validated);

        return response()->json($banner, 201);
    }

    public function show($id)
    {
        $banner = Banner::findOrFail($id);
        return response()->json($banner);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
            'link' => 'nullable|url',
            'page' => 'nullable|string|in:homepage,about,new-arrivals,dealers,contact',
            'order' => 'nullable|integer',
            'is_active' => 'nullable',
        ]);
        
        // Handle empty strings as null for title and description
        if ($request->has('title') && $request->input('title') === '') {
            $validated['title'] = null;
        }
        if ($request->has('description') && $request->input('description') === '') {
            $validated['description'] = null;
        }

        if ($request->hasFile('image')) {
            if ($banner->image_path) {
                Storage::disk('public')->delete($banner->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('banners', 'public');
        }

        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        // Ensure page field is updated if provided
        if ($request->has('page')) {
            $pageValue = $request->input('page');
            $validated['page'] = !empty($pageValue) ? $pageValue : null;
        }

        Log::info('Updating banner', [
            'id' => $id,
            'page_value' => $request->input('page'),
            'validated_page' => $validated['page'] ?? 'not set'
        ]);

        $banner->update($validated);
        
        // Refresh to get updated values
        $banner->refresh();
        
        Log::info('Banner updated', [
            'id' => $banner->id,
            'page' => $banner->page,
            'is_active' => $banner->is_active
        ]);

        return response()->json($banner);
    }

    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);
        
        if ($banner->image_path) {
            Storage::disk('public')->delete($banner->image_path);
        }
        
        $banner->delete();

        return response()->json(['message' => 'Banner deleted successfully']);
    }

    public function uploadImage(Request $request, $id)
    {
        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        $banner = Banner::findOrFail($id);
        
        if ($banner->image_path) {
            Storage::disk('public')->delete($banner->image_path);
        }
        
        $path = $request->file('image')->store('banners', 'public');
        $banner->update(['image_path' => $path]);

        return response()->json($banner);
    }
}

