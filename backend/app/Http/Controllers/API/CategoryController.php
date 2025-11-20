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
        // Optimize: Eager load with ordered images and select specific columns
        $category = Category::with([
            'subcategories:id,category_id,name,slug,order',
            'products' => function($q) {
                $q->where('is_active', true)
                  ->orderBy('order')
                  ->select('id', 'category_id', 'subcategory_id', 'name', 'slug', 'description', 'short_description', 'price', 'sale_price', 'is_best_seller', 'is_new_arrival', 'is_featured', 'order');
            },
            'products.images' => function($q) {
                $q->orderBy('order')->orderBy('is_primary', 'desc')
                  ->select('id', 'product_id', 'image_path', 'alt_text', 'order', 'is_primary');
            },
            'seo'
        ])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json($category);
    }
}

