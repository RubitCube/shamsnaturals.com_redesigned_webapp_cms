<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SeoMeta;
use Illuminate\Http\Request;

class SeoController extends Controller
{
    public function index()
    {
        // Get all pages, products, categories, blogs, and events with their SEO data
        $pages = \App\Models\Page::with('seo')->orderBy('title')->get()->map(function($item) {
            return [
                'id' => $item->id,
                'title' => $item->title,
                'slug' => $item->slug,
                'type' => 'page',
                'type_label' => 'Page',
                'seo' => $item->seo,
                'images' => $item->images,
                'is_active' => $item->is_active,
            ];
        });

        $products = \App\Models\Product::with('seo')->orderBy('name')->get()->map(function($item) {
            return [
                'id' => $item->id,
                'title' => $item->name,
                'slug' => $item->slug,
                'type' => 'product',
                'type_label' => 'Product',
                'seo' => $item->seo,
                'images' => null, // Products have separate image management
                'is_active' => $item->is_active,
            ];
        });

        $categories = \App\Models\Category::with('seo')->orderBy('name')->get()->map(function($item) {
            return [
                'id' => $item->id,
                'title' => $item->name,
                'slug' => $item->slug,
                'type' => 'category',
                'type_label' => 'Category',
                'seo' => $item->seo,
                'images' => null,
                'is_active' => $item->is_active,
            ];
        });

        $blogs = \App\Models\Blog::with('seo')->orderBy('title')->get()->map(function($item) {
            return [
                'id' => $item->id,
                'title' => $item->title,
                'slug' => $item->slug,
                'type' => 'blog',
                'type_label' => 'Blog',
                'seo' => $item->seo,
                'images' => null,
                'is_active' => $item->is_published,
            ];
        });

        $events = \App\Models\Event::with('seo')->orderBy('title')->get()->map(function($item) {
            return [
                'id' => $item->id,
                'title' => $item->title,
                'slug' => $item->slug,
                'type' => 'event',
                'type_label' => 'Event',
                'seo' => $item->seo,
                'images' => null,
                'is_active' => $item->is_published,
            ];
        });

        // Combine all items and sort by title
        $allItems = collect()
            ->merge($pages)
            ->merge($products)
            ->merge($categories)
            ->merge($blogs)
            ->merge($events)
            ->sortBy('title')
            ->values();
        
        // Debug logging
        \Log::info('SEO Management - Items Count', [
            'pages' => $pages->count(),
            'products' => $products->count(),
            'categories' => $categories->count(),
            'blogs' => $blogs->count(),
            'events' => $events->count(),
            'total' => $allItems->count(),
            'sample_items' => $allItems->take(5)->map(function($item) {
                return ['type' => $item['type'], 'title' => $item['title']];
            })->toArray(),
        ]);
        
        return response()->json($allItems->toArray());
    }

    public function show($type, $id)
    {
        $model = $this->getModel($type, $id);
        $seo = $model->seo;

        return response()->json($seo ?? [
            'meta_title' => null,
            'meta_description' => null,
            'meta_keywords' => null,
            'og_image' => null,
            'image_seo' => null,
        ]);
    }

    public function update(Request $request, $type, $id)
    {
        $model = $this->getModel($type, $id);

        $validated = $request->validate([
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:500',
            'og_image' => 'nullable|string',
            'image_seo' => 'nullable|array',
            'image_seo.*.alt' => 'nullable|string|max:255',
            'image_seo.*.title' => 'nullable|string|max:255',
        ]);

        $seo = $model->seo ?? new SeoMeta();
        $seo->metaable_type = get_class($model);
        $seo->metaable_id = $model->id;
        $seo->fill($validated);
        $seo->save();

        return response()->json($seo);
    }

    private function getModel($type, $id)
    {
        $models = [
            'product' => \App\Models\Product::class,
            'category' => \App\Models\Category::class,
            'page' => \App\Models\Page::class,
            'blog' => \App\Models\Blog::class,
            'event' => \App\Models\Event::class,
        ];

        if (!isset($models[$type])) {
            abort(404, 'Invalid SEO type');
        }

        return $models[$type]::findOrFail($id);
    }
}

