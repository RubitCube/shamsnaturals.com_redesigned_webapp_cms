<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PageController extends Controller
{
    public function index()
    {
        $pages = Page::orderBy('created_at', 'desc')->get();
        return response()->json($pages);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_active' => 'nullable',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        $page = Page::create($validated);

        return response()->json($page, 201);
    }

    public function show($id)
    {
        $page = Page::with('seo')->findOrFail($id);
        return response()->json($page);
    }

    public function update(Request $request, $id)
    {
        $page = Page::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_active' => 'nullable',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        $page->update($validated);

        return response()->json($page);
    }

    public function destroy($id)
    {
        $page = Page::findOrFail($id);
        
        // Delete associated images
        if ($page->images) {
            foreach ($page->images as $imagePath) {
                if (is_string($imagePath) && Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
        }
        
        $page->delete();

        return response()->json(['message' => 'Page deleted successfully']);
    }

    public function uploadImage(Request $request, $id)
    {
        $request->validate([
            'image' => 'required|image|max:5120',
            'image_type' => 'required|string|in:main_image,decorative_image_1,decorative_image_2',
        ]);

        $page = Page::findOrFail($id);
        
        $path = $request->file('image')->store('pages', 'public');
        
        $images = $page->images ?? [];
        
        // Delete old image if exists
        if (isset($images[$request->image_type]) && Storage::disk('public')->exists($images[$request->image_type])) {
            Storage::disk('public')->delete($images[$request->image_type]);
        }
        
        $images[$request->image_type] = $path;
        $page->update(['images' => $images]);

        return response()->json(['image_path' => $path, 'images' => $images]);
    }

    public function removeImage(Request $request, $id)
    {
        $request->validate([
            'image_type' => 'required|string|in:main_image,decorative_image_1,decorative_image_2',
        ]);

        $page = Page::findOrFail($id);
        $images = $page->images ?? [];
        
        if (isset($images[$request->image_type])) {
            if (Storage::disk('public')->exists($images[$request->image_type])) {
                Storage::disk('public')->delete($images[$request->image_type]);
            }
            unset($images[$request->image_type]);
            $page->update(['images' => $images]);
        }

        return response()->json(['message' => 'Image removed successfully', 'images' => $images]);
    }
}

