<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Banner;
use App\Models\Product;
use App\Models\Event;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function homepage()
    {
        $banners = Banner::where('is_active', true)
            ->where(function($q) {
                $q->where('page', 'homepage')->orWhereNull('page');
            })
            ->orderBy('order')
            ->get();

        $bestProducts = Product::with(['category', 'subcategory', 'images'])
            ->where('is_active', true)
            ->where('is_best_seller', true)
            ->orderBy('order')
            ->limit(10)
            ->get();

        $newArrivals = Product::with(['category', 'subcategory', 'images'])
            ->where('is_active', true)
            ->where('is_new_arrival', true)
            ->orderBy('created_at', 'desc')
            ->get();

        $events = Event::where('is_published', true)
            ->orderBy('event_date', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'banners' => $banners,
            'best_products' => $bestProducts,
            'new_arrivals' => $newArrivals,
            'events' => $events,
        ]);
    }

    public function about()
    {
        $page = Page::with('seo')
            ->where('slug', 'about-us')
            ->where('is_active', true)
            ->firstOrFail();

        $banners = Banner::where('is_active', true)
            ->where('page', 'about')
            ->orderBy('order')
            ->get();

        return response()->json([
            'page' => $page,
            'banners' => $banners,
        ]);
    }

    public function show($slug)
    {
        $page = Page::with('seo')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json($page);
    }
}

