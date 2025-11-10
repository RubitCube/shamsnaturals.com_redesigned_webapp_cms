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
            'phone' => 'nullable|string|max:20',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'is_active' => 'nullable',
        ]);

        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        // Geocode address to get latitude and longitude
        $coordinates = $this->geocodeAddress($validated);
        if ($coordinates) {
            $validated['latitude'] = $coordinates['lat'];
            $validated['longitude'] = $coordinates['lng'];
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
            'phone' => 'nullable|string|max:20',
            'address' => 'required|string',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'is_active' => 'nullable',
        ]);

        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        // Re-geocode if address changed
        if ($dealer->address !== $validated['address'] || 
            $dealer->city !== $validated['city'] ||
            $dealer->state !== $validated['state'] ||
            $dealer->country !== $validated['country']) {
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

    private function geocodeAddress($data)
    {
        $apiKey = config('services.google_maps.api_key');
        if (!$apiKey) {
            return null;
        }

        $address = implode(', ', [
            $data['address'],
            $data['city'],
            $data['state'],
            $data['country']
        ]);

        $response = Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
            'address' => $address,
            'key' => $apiKey,
        ]);

        $result = $response->json();

        if ($result['status'] === 'OK' && !empty($result['results'])) {
            $location = $result['results'][0]['geometry']['location'];
            return [
                'lat' => $location['lat'],
                'lng' => $location['lng'],
            ];
        }

        return null;
    }
}

