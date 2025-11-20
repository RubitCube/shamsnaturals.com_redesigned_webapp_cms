<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with('subcategories')
            ->withCount('products')
            ->orderBy('order')
            ->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'banner' => 'nullable|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'order' => 'nullable|integer',
            'is_active' => 'nullable',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('categories/images', 'public');
        }

        if ($request->hasFile('banner')) {
            $validated['banner'] = $request->file('banner')->store('categories/banners', 'public');
        }

        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    public function show($id)
    {
        $category = Category::with(['subcategories', 'seo'])->findOrFail($id);
        return response()->json($category);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'banner' => 'nullable|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'order' => 'nullable|integer',
            'is_active' => 'nullable',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $validated['image'] = $request->file('image')->store('categories/images', 'public');
        }

        if ($request->hasFile('banner')) {
            if ($category->banner) {
                Storage::disk('public')->delete($category->banner);
            }
            $validated['banner'] = $request->file('banner')->store('categories/banners', 'public');
        }

        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        $category->update($validated);

        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }
        if ($category->banner) {
            Storage::disk('public')->delete($category->banner);
        }
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|integer|exists:categories,id',
            'orders.*.order' => 'required|integer',
        ]);

        // Optimize: Use bulk update with case statement for better performance
        $cases = [];
        $ids = [];
        $bindings = [];

        foreach ($validated['orders'] as $orderData) {
            $cases[] = "WHEN ? THEN ?";
            $bindings[] = $orderData['id'];
            $bindings[] = $orderData['order'];
            $ids[] = $orderData['id'];
        }

        if (!empty($cases)) {
            $casesString = implode(' ', $cases);
            $idsPlaceholders = implode(',', array_fill(0, count($ids), '?'));
            
            \DB::statement(
                "UPDATE categories SET `order` = CASE id {$casesString} END WHERE id IN ({$idsPlaceholders})",
                array_merge($bindings, $ids)
            );
        }

        return response()->json(['message' => 'Category priority updated successfully']);
    }
}

