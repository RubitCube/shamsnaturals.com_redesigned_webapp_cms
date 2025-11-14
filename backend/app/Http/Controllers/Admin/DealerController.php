<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dealer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DealerController extends Controller
{
    public function index()
    {
        $dealers = Dealer::orderBy('country')
            ->orderBy('state')
            ->get();

        return response()->json($dealers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email|unique:dealers,email',
            'phoneNumbers' => 'nullable|array',
            'phoneNumbers.*' => 'nullable|string|max:255',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'location_embed' => 'nullable|string',
            'website' => 'nullable|string', // Allow any string, not just valid URLs
            'is_active' => 'nullable',
        ]);

        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        // Handle phone numbers
        $validated['phone'] = $this->normalizePhones($request->input('phoneNumbers'));
        
        // Handle description (location_embed + website)
        $validated['description'] = json_encode([
            'location' => $request->input('location_embed'),
            'website' => $request->input('website'),
        ]);

        // Extract coordinates from Google Maps embed iframe (PRIORITY)
        $embedCoordinates = $this->extractCoordinatesFromEmbed($request->input('location_embed'));
        
        // Remove temporary fields
        unset($validated['phoneNumbers']);
        unset($validated['location_embed']);
        unset($validated['website']);

        // Use embed coordinates if available, otherwise geocode address
        if ($embedCoordinates) {
            $validated['latitude'] = $embedCoordinates['lat'];
            $validated['longitude'] = $embedCoordinates['lng'];
            \Log::info('Using coordinates from Google Maps embed', $embedCoordinates);
        } else {
            // Fallback: Geocode address to get latitude and longitude
            $coordinates = $this->geocodeAddress($validated);
            if ($coordinates) {
                $validated['latitude'] = $coordinates['lat'];
                $validated['longitude'] = $coordinates['lng'];
            }
        }

        $dealer = Dealer::create($validated);

        return response()->json($dealer, 201);
    }

    public function show($id)
    {
        $dealer = Dealer::findOrFail($id);
        return response()->json($dealer);
    }

    public function update(Request $request, $id)
    {
        $dealer = Dealer::findOrFail($id);

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email|unique:dealers,email,' . $id,
            'phoneNumbers' => 'nullable|array',
            'phoneNumbers.*' => 'nullable|string|max:255',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'location_embed' => 'nullable|string',
            'website' => 'nullable|string', // Allow any string, not just valid URLs
            'is_active' => 'nullable',
        ]);

        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        // Handle phone numbers
        $validated['phone'] = $this->normalizePhones($request->input('phoneNumbers'));
        
        // Handle description (location_embed + website)
        $validated['description'] = json_encode([
            'location' => $request->input('location_embed'),
            'website' => $request->input('website'),
        ]);

        // Extract coordinates from Google Maps embed iframe (PRIORITY)
        $embedCoordinates = $this->extractCoordinatesFromEmbed($request->input('location_embed'));
        
        // Remove temporary fields
        unset($validated['phoneNumbers']);
        unset($validated['location_embed']);
        unset($validated['website']);

        // Use embed coordinates if available, otherwise geocode if needed
        if ($embedCoordinates) {
            $validated['latitude'] = $embedCoordinates['lat'];
            $validated['longitude'] = $embedCoordinates['lng'];
            \Log::info('Using coordinates from Google Maps embed (update)', $embedCoordinates);
        } elseif (!$dealer->latitude || !$dealer->longitude ||
            $dealer->address !== $validated['address'] || 
            $dealer->city !== $validated['city'] ||
            $dealer->state !== $validated['state'] ||
            $dealer->country !== $validated['country']) {
            // Fallback: Re-geocode if address changed OR if coordinates are missing
            $coordinates = $this->geocodeAddress($validated);
            if ($coordinates) {
                $validated['latitude'] = $coordinates['lat'];
                $validated['longitude'] = $coordinates['lng'];
            }
        }

        $dealer->update($validated);

        return response()->json($dealer);
    }

    public function destroy($id)
    {
        $dealer = Dealer::findOrFail($id);
        $dealer->delete();

        return response()->json(['message' => 'Dealer deleted successfully']);
    }

    /**
     * Extract latitude and longitude from Google Maps embed iframe URL
     * Example: pb=!1m18!1m12!1m3!1d3961.537!2d39.276426!3d-6.825993!...
     * The 3d parameter after 1m3 contains: 3d{latitude}!2d{longitude}
     */
    private function extractCoordinatesFromEmbed($embedCode)
    {
        if (empty($embedCode)) {
            return null;
        }

        try {
            // Extract src URL from iframe
            if (preg_match('/src=["\']([^"\']+)["\']/', $embedCode, $matches)) {
                $url = $matches[1];
            } else {
                $url = $embedCode;
            }

            // Decode URL-encoded characters
            $url = urldecode($url);

            // Method 1: Extract from pb parameter (most accurate for embed URLs)
            // Format: !3d{latitude}!2d{longitude} or !2d{longitude}!3d{latitude}
            if (preg_match('/!2d([-\d.]+)!3d([-\d.]+)/', $url, $matches)) {
                $lng = (float) $matches[1];
                $lat = (float) $matches[2];
                
                if ($this->isValidCoordinate($lat, $lng)) {
                    \Log::info('Extracted coordinates from Google Maps embed (pb parameter)', [
                        'lat' => $lat,
                        'lng' => $lng,
                        'url' => substr($url, 0, 100)
                    ]);
                    
                    return [
                        'lat' => $lat,
                        'lng' => $lng,
                    ];
                }
            }

            // Method 2: Extract from ll parameter (fallback)
            if (preg_match('/ll=([-\d.]+),([-\d.]+)/', $url, $matches)) {
                $lat = (float) $matches[1];
                $lng = (float) $matches[2];
                
                if ($this->isValidCoordinate($lat, $lng)) {
                    \Log::info('Extracted coordinates from Google Maps embed (ll parameter)', [
                        'lat' => $lat,
                        'lng' => $lng
                    ]);
                    
                    return [
                        'lat' => $lat,
                        'lng' => $lng,
                    ];
                }
            }

            // Method 3: Extract from center parameter
            if (preg_match('/center=([-\d.]+)%2C([-\d.]+)/', $url, $matches)) {
                $lat = (float) $matches[1];
                $lng = (float) $matches[2];
                
                if ($this->isValidCoordinate($lat, $lng)) {
                    \Log::info('Extracted coordinates from Google Maps embed (center parameter)', [
                        'lat' => $lat,
                        'lng' => $lng
                    ]);
                    
                    return [
                        'lat' => $lat,
                        'lng' => $lng,
                    ];
                }
            }

            \Log::warning('Could not extract coordinates from Google Maps embed', [
                'url' => substr($url, 0, 150)
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error extracting coordinates from embed', [
                'message' => $e->getMessage(),
                'embed' => substr($embedCode, 0, 100)
            ]);
        }

        return null;
    }

    /**
     * Validate latitude and longitude ranges
     */
    private function isValidCoordinate($lat, $lng)
    {
        return $lat >= -90 && $lat <= 90 && $lng >= -180 && $lng <= 180;
    }

    /**
     * Geocode address using Nominatim (OpenStreetMap) - completely FREE
     * No API key required, no usage limits (fair use: max 1 request/sec)
     */
    private function geocodeAddress($data)
    {
        $address = implode(', ', array_filter([
            $data['address'] ?? '',
            $data['city'] ?? '',
            $data['state'] ?? '',
            $data['country'] ?? '',
        ]));

        if (empty($address)) {
            return null;
        }

        try {
            // Use Nominatim (OpenStreetMap) - FREE geocoding service
            $response = Http::withHeaders([
                'User-Agent' => 'Shams-Naturals-ECommerce/1.0', // Required by Nominatim
            ])->timeout(10)->get('https://nominatim.openstreetmap.org/search', [
                'q' => $address,
                'format' => 'json',
                'limit' => 1,
                'addressdetails' => 1,
            ]);

            // Respect Nominatim's usage policy: max 1 request per second
            sleep(1);

            if ($response->successful()) {
                $results = $response->json();

                if (!empty($results)) {
                    $location = $results[0];

                    \Log::info('Nominatim geocoding successful', [
                        'address' => $address,
                        'lat' => $location['lat'],
                        'lon' => $location['lon'],
                    ]);

                    return [
                        'lat' => (float) $location['lat'],
                        'lng' => (float) $location['lon'],
                    ];
                }

                \Log::warning('Nominatim: no results found', ['address' => $address]);
            }
        } catch (\Exception $e) {
            \Log::error('Nominatim geocoding error', [
                'message' => $e->getMessage(),
                'address' => $address,
            ]);
        }

        return null;
    }

    private function normalizePhones($value): ?string
    {
        if ($value === null) {
            return null;
        }

        $phones = [];

        if (is_array($value)) {
            $phones = $value;
        } elseif (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $phones = $decoded;
            } elseif (trim($value) !== '') {
                $phones = [$value];
            }
        }

        $normalized = collect($phones)
            ->map(function ($phone) {
                if (!is_string($phone)) {
                    return null;
                }

                $trimmed = preg_replace('/\\s+/', '', trim($phone));
                if (!$trimmed) {
                    return null;
                }

                if (!str_starts_with($trimmed, '+')) {
                    $trimmed = '+' . ltrim($trimmed, '+');
                }

                return $trimmed;
            })
            ->filter()
            ->unique()
            ->values()
            ->all();

        return count($normalized) ? json_encode($normalized) : null;
    }
}

