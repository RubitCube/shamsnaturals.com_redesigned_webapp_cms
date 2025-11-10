<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index(Request $request)
    {
        $query = Banner::where('is_active', true);

        $pageParam = $request->input('page');
        
        // Debug logging
        \Log::info('Banner API Request', [
            'all_params' => $request->all(),
            'page_param' => $pageParam,
            'has_page' => $request->has('page'),
            'page_value' => $request->page,
        ]);

        if ($pageParam) {
            $query->where('page', $pageParam);
            \Log::info('Filtering by page', ['page' => $pageParam]);
        } else {
            // Default to homepage banners if no page specified
            $query->where(function($q) {
                $q->where('page', 'homepage')->orWhereNull('page');
            });
            \Log::info('Using default homepage filter');
        }

        $banners = $query->orderBy('order')->get();

        \Log::info('Banner API Response', [
            'page_param' => $pageParam,
            'banners_count' => $banners->count(),
            'banners' => $banners->map(function($b) {
                return ['id' => $b->id, 'page' => $b->page, 'is_active' => $b->is_active, 'image' => $b->image_path];
            })
        ]);

        return response()->json($banners);
    }
}

