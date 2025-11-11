<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function storeVisit(Request $request)
    {
        $data = $request->validate([
            'path' => 'required|string|max:255',
            'title' => 'nullable|string|max:255',
            'referrer' => 'nullable|string|max:255',
        ]);

        $this->storeEventInternal('visit', $data['path'], $data['title'] ?? null, $data['referrer'] ?? null, $request);

        return response()->json(['status' => 'ok'], 201);
    }

    public function storeEvent(Request $request)
    {
        $data = $request->validate([
            'event_type' => 'required|string|max:100',
            'path' => 'nullable|string|max:255',
            'label' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
            'referrer' => 'nullable|string|max:255',
        ]);

        $this->storeEventInternal(
            $data['event_type'],
            $data['path'] ?? null,
            $data['label'] ?? null,
            $data['referrer'] ?? null,
            $request,
            $data['metadata'] ?? null
        );

        return response()->json(['status' => 'ok'], 201);
    }

    public function publicSummary()
    {
        $totalVisits = AnalyticsEvent::where('event_type', 'visit')->count();
        $todayVisits = AnalyticsEvent::where('event_type', 'visit')
            ->whereDate('created_at', Carbon::today())
            ->count();

        return response()->json([
            'total_visits' => $totalVisits,
            'today_visits' => $todayVisits,
        ]);
    }

    private function storeEventInternal(
        string $eventType,
        ?string $path,
        ?string $label,
        ?string $referrer,
        Request $request,
        ?array $metadata = null
    ): void {
        AnalyticsEvent::create([
            'event_type' => $eventType,
            'path' => $path,
            'label' => $label,
            'metadata' => $metadata,
            'referrer' => $referrer,
            'ip_address' => $request->ip(),
            'user_agent' => substr($request->userAgent() ?? '', 0, 255),
        ]);
    }
}


