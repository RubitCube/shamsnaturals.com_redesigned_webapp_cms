<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'subcategory', 'images'])
            ->where('is_active', true);

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('subcategory')) {
            $query->where('subcategory_id', $request->subcategory);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->orderBy('order')->paginate(12);

        return response()->json($products);
    }

    public function show($slug)
    {
        $product = Product::with(['category', 'subcategory', 'images', 'seo'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json($product);
    }

    public function bestProducts()
    {
        $products = Product::with(['category', 'subcategory', 'images'])
            ->where('is_active', true)
            ->where('is_best_seller', true)
            ->orderBy('order')
            ->limit(10)
            ->get();

        return response()->json($products);
    }

    public function newArrivals()
    {
        $products = Product::with(['category', 'subcategory', 'images'])
            ->where('is_active', true)
            ->where('is_new_arrival', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($products);
    }

    public function byCategory($category)
    {
        $categoryModel = Category::where('slug', $category)->firstOrFail();
        
        $products = Product::with(['category', 'subcategory', 'images'])
            ->where('category_id', $categoryModel->id)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return response()->json($products);
    }

    public function bySubcategory($category, $subcategory)
    {
        $categoryModel = Category::where('slug', $category)->firstOrFail();
        $subcategoryModel = Subcategory::where('slug', $subcategory)
            ->where('category_id', $categoryModel->id)
            ->firstOrFail();
        
        $products = Product::with(['category', 'subcategory', 'images'])
            ->where('subcategory_id', $subcategoryModel->id)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return response()->json($products);
    }
}

