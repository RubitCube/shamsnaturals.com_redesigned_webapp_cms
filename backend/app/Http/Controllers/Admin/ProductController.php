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
    public function index(Request $request)
    {
        // Optimize: Eager load relationships with ordered images
        $query = Product::with([
            'category:id,name,slug',
            'subcategory:id,name,slug',
            'images' => function($q) {
                $q->orderBy('order')->orderBy('is_primary', 'desc');
            }
        ])->orderBy('id', 'asc');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        $perPage = $request->input('per_page', 20);
        $products = $query->paginate($perPage);

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
        // Optimize: Eager load with ordered images
        $product = Product::with([
            'category:id,name,slug',
            'subcategory:id,name,slug',
            'images' => function($q) {
                $q->orderBy('order')->orderBy('is_primary', 'desc');
            },
            'seo'
        ])->findOrFail($id);

        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        // Optimize: Use select() to only fetch needed columns
        $product = Product::select('id', 'name', 'slug', 'category_id', 'subcategory_id', 'description', 'short_description', 'price', 'sale_price', 'sku', 'stock_quantity', 'is_best_seller', 'is_new_arrival', 'is_featured', 'is_active', 'order')
            ->findOrFail($id);

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
            'is_primary' => 'nullable',
        ]);

        $product = Product::findOrFail($id);
        
        // Store with original filename
        $file = $request->file('image');
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $filename = pathinfo($originalName, PATHINFO_FILENAME);
        
        // Sanitize filename and ensure uniqueness
        $safeFilename = preg_replace('/[^a-zA-Z0-9_-]/', '_', $filename);
        $uniqueFilename = $safeFilename . '_' . time() . '.' . $extension;
        
        $path = $file->storeAs('products', $uniqueFilename, 'public');
        
        // Convert is_primary to boolean
        $isPrimary = filter_var($request->input('is_primary', false), FILTER_VALIDATE_BOOLEAN);
        
        $image = ProductImage::create([
            'product_id' => $product->id,
            'image_path' => $path,
            'alt_text' => $request->alt_text,
            'is_primary' => $isPrimary,
        ]);

        // Optimize: Use single query to update all other images
        if ($isPrimary) {
            ProductImage::where('product_id', $product->id)
                ->where('id', '!=', $image->id)
                ->update(['is_primary' => false]);
        }

        return response()->json($image, 201);
    }

    public function reorderImages(Request $request, $id)
    {
        $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:product_images,id',
            'orders.*.order' => 'required|integer|min:0',
        ]);

        $product = Product::findOrFail($id);

        // Optimize: Use bulk update with case statement for better performance
        $cases = [];
        $ids = [];
        $bindings = [];

        foreach ($request->input('orders') as $orderData) {
            $cases[] = "WHEN ? THEN ?";
            $bindings[] = $orderData['id'];
            $bindings[] = $orderData['order'];
            $ids[] = $orderData['id'];
        }

        if (!empty($cases)) {
            $casesString = implode(' ', $cases);
            $idsPlaceholders = implode(',', array_fill(0, count($ids), '?'));
            
            \DB::statement(
                "UPDATE product_images SET `order` = CASE id {$casesString} END WHERE id IN ({$idsPlaceholders}) AND product_id = ?",
                array_merge($bindings, $ids, [$product->id])
            );
        }

        return response()->json(['message' => 'Image order updated successfully']);
    }
}

