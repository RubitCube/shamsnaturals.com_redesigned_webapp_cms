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
        // Optimize: Select only needed columns and eager load with ordered images
        $query = Product::with([
            'category:id,name,slug',
            'subcategory:id,name,slug',
            'images' => function($q) {
                $q->orderBy('order')->orderBy('is_primary', 'desc')
                  ->select('id', 'product_id', 'image_path', 'alt_text', 'order', 'is_primary');
            }
        ])->where('is_active', true);

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
        // Optimize: Eager load with ordered images and select specific columns
        $product = Product::with([
            'category:id,name,slug',
            'subcategory:id,name,slug',
            'images' => function($q) {
                $q->orderBy('order')->orderBy('is_primary', 'desc')
                  ->select('id', 'product_id', 'image_path', 'alt_text', 'order', 'is_primary');
            },
            'seo'
        ])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json($product);
    }

    public function bestProducts()
    {
        // Optimize: Select only needed columns and eager load with ordered images
        $products = Product::with([
            'category:id,name,slug',
            'subcategory:id,name,slug',
            'images' => function($q) {
                $q->orderBy('order')->orderBy('is_primary', 'desc')
                  ->select('id', 'product_id', 'image_path', 'alt_text', 'order', 'is_primary');
            }
        ])
            ->where('is_active', true)
            ->where('is_best_seller', true)
            ->orderBy('order')
            ->limit(10)
            ->get();

        return response()->json($products);
    }

    public function newArrivals()
    {
        // Optimize: Select only needed columns and eager load with ordered images
        $products = Product::with([
            'category:id,name,slug',
            'subcategory:id,name,slug',
            'images' => function($q) {
                $q->orderBy('order')->orderBy('is_primary', 'desc')
                  ->select('id', 'product_id', 'image_path', 'alt_text', 'order', 'is_primary');
            }
        ])
            ->where('is_active', true)
            ->where('is_new_arrival', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($products);
    }

    public function byCategory($category)
    {
        // Optimize: Select only id from category, and eager load with ordered images
        $categoryModel = Category::where('slug', $category)->select('id')->firstOrFail();
        
        $products = Product::with([
            'category:id,name,slug',
            'subcategory:id,name,slug',
            'images' => function($q) {
                $q->orderBy('order')->orderBy('is_primary', 'desc')
                  ->select('id', 'product_id', 'image_path', 'alt_text', 'order', 'is_primary');
            }
        ])
            ->where('category_id', $categoryModel->id)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return response()->json($products);
    }

    public function bySubcategory($category, $subcategory)
    {
        // Optimize: Select only id from models, and eager load with ordered images
        $categoryModel = Category::where('slug', $category)->select('id')->firstOrFail();
        $subcategoryModel = Subcategory::where('slug', $subcategory)
            ->where('category_id', $categoryModel->id)
            ->select('id')
            ->firstOrFail();
        
        $products = Product::with([
            'category:id,name,slug',
            'subcategory:id,name,slug',
            'images' => function($q) {
                $q->orderBy('order')->orderBy('is_primary', 'desc')
                  ->select('id', 'product_id', 'image_path', 'alt_text', 'order', 'is_primary');
            }
        ])
            ->where('subcategory_id', $subcategoryModel->id)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return response()->json($products);
    }
}

