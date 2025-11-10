<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'subcategory', 'images'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|unique:products,sku',
            'stock_quantity' => 'nullable|integer|min:0',
            'is_best_seller' => 'nullable',
            'is_new_arrival' => 'nullable',
            'is_featured' => 'nullable',
            'is_active' => 'nullable',
            'order' => 'nullable|integer',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        // Convert boolean strings to actual booleans
        $validated['is_best_seller'] = filter_var($request->input('is_best_seller', false), FILTER_VALIDATE_BOOLEAN);
        $validated['is_new_arrival'] = filter_var($request->input('is_new_arrival', false), FILTER_VALIDATE_BOOLEAN);
        $validated['is_featured'] = filter_var($request->input('is_featured', false), FILTER_VALIDATE_BOOLEAN);
        $validated['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'subcategory', 'images', 'seo'])
            ->findOrFail($id);

        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|unique:products,sku,' . $id,
            'stock_quantity' => 'nullable|integer|min:0',
            'is_best_seller' => 'nullable',
            'is_new_arrival' => 'nullable',
            'is_featured' => 'nullable',
            'is_active' => 'nullable',
            'order' => 'nullable|integer',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        // Convert boolean strings to actual booleans
        if ($request->has('is_best_seller')) {
            $validated['is_best_seller'] = filter_var($request->input('is_best_seller'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('is_new_arrival')) {
            $validated['is_new_arrival'] = filter_var($request->input('is_new_arrival'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('is_featured')) {
            $validated['is_featured'] = filter_var($request->input('is_featured'), FILTER_VALIDATE_BOOLEAN);
        }
        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        $product->update($validated);

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function uploadImage(Request $request, $id)
    {
        $request->validate([
            'image' => 'required|image|max:2048',
            'alt_text' => 'nullable|string|max:255',
            'is_primary' => 'boolean',
        ]);

        $product = Product::findOrFail($id);
        
        $path = $request->file('image')->store('products', 'public');
        
        $image = ProductImage::create([
            'product_id' => $product->id,
            'image_path' => $path,
            'alt_text' => $request->alt_text,
            'is_primary' => $request->is_primary ?? false,
        ]);

        if ($request->is_primary) {
            ProductImage::where('product_id', $product->id)
                ->where('id', '!=', $image->id)
                ->update(['is_primary' => false]);
        }

        return response()->json($image, 201);
    }
}

