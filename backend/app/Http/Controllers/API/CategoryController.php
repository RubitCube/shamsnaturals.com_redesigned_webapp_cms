<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with(['subcategories'])
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return response()->json($categories);
    }

    public function show($slug)
    {
        $category = Category::with(['subcategories', 'products.images', 'seo'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json($category);
    }
}

