<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = Blog::orderBy('created_at', 'desc')->paginate(20);
        return response()->json($blogs);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'featured_image' => 'nullable|image|max:2048',
            'published_at' => 'nullable|date',
            'is_published' => 'nullable',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        if ($request->hasFile('featured_image')) {
            $validated['featured_image'] = $request->file('featured_image')->store('blogs', 'public');
        }

        if ($request->has('is_published')) {
            $validated['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN);
        }

        $blog = Blog::create($validated);

        return response()->json($blog, 201);
    }

    public function show($id)
    {
        $blog = Blog::with('seo')->findOrFail($id);
        return response()->json($blog);
    }

    public function update(Request $request, $id)
    {
        $blog = Blog::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'featured_image' => 'nullable|image|max:2048',
            'published_at' => 'nullable|date',
            'is_published' => 'nullable',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        if ($request->hasFile('featured_image')) {
            if ($blog->featured_image) {
                Storage::disk('public')->delete($blog->featured_image);
            }
            $validated['featured_image'] = $request->file('featured_image')->store('blogs', 'public');
        }

        if ($request->has('is_published')) {
            $validated['is_published'] = filter_var($request->input('is_published'), FILTER_VALIDATE_BOOLEAN);
        }

        $blog->update($validated);

        return response()->json($blog);
    }

    public function destroy($id)
    {
        $blog = Blog::findOrFail($id);
        
        if ($blog->featured_image) {
            Storage::disk('public')->delete($blog->featured_image);
        }
        
        $blog->delete();

        return response()->json(['message' => 'Blog deleted successfully']);
    }
}

