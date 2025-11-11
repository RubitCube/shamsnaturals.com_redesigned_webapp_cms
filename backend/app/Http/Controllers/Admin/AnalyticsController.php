<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use App\Models\Product;
use App\Models\Category;
use App\Models\Dealer;
use App\Models\Country;
use App\Models\Event;
use App\Models\Blog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function summary(): JsonResponse
    {
        $totalVisits = AnalyticsEvent::where('event_type', 'visit')->count();
        $todayVisits = AnalyticsEvent::where('event_type', 'visit')
            ->whereDate('created_at', Carbon::today())
            ->count();

        $totalLinkClicks = AnalyticsEvent::where('event_type', 'link_click')->count();

        $visitsPerDay = AnalyticsEvent::where('event_type', 'visit')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $topPages = AnalyticsEvent::where('event_type', 'visit')
            ->selectRaw('path, COUNT(*) as total')
            ->groupBy('path')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        $topLinks = AnalyticsEvent::where('event_type', 'link_click')
            ->selectRaw('label, COUNT(*) as total')
            ->groupBy('label')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        // CMS Stats
        $totalProducts = Product::count();
        $totalCategories = Category::count();
        $totalDealers = Dealer::count();
        $totalCountries = Country::count();
        $totalEvents = Event::count();
        $totalBlogs = Blog::count();

        return response()->json([
            'totals' => [
                'visits' => $totalVisits,
                'visits_today' => $todayVisits,
                'link_clicks' => $totalLinkClicks,
            ],
            'cms_stats' => [
                'products' => $totalProducts,
                'categories' => $totalCategories,
                'dealers' => $totalDealers,
                'countries' => $totalCountries,
                'events' => $totalEvents,
                'blogs' => $totalBlogs,
            ],
            'visits_per_day' => $visitsPerDay,
            'top_pages' => $topPages,
            'top_links' => $topLinks,
        ]);
    }
}


