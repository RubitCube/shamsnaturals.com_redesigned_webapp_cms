<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = Blog::where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->paginate(10);

        return response()->json($blogs);
    }

    public function show($slug)
    {
        $blog = Blog::with('seo')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json($blog);
    }
}

