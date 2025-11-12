<?php

namespace App\Console\Commands;

use App\Models\Dealer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class GeocodeExistingDealers extends Command
{
    protected $signature = 'dealers:geocode {--force : Force re-geocoding of all dealers}';
    protected $description = 'Geocode existing dealers that are missing latitude/longitude coordinates';

    public function handle()
    {
        $this->info('Using Nominatim (OpenStreetMap) - FREE geocoding service');
        $this->info('No API key required!');

        $query = Dealer::query();
        
        if ($this->option('force')) {
            $dealers = $query->get();
            $this->info('Force mode: Re-geocoding all ' . $dealers->count() . ' dealers...');
        } else {
            $dealers = $query->whereNull('latitude')
                ->orWhereNull('longitude')
                ->get();
            $this->info('Found ' . $dealers->count() . ' dealers without coordinates');
        }

        if ($dealers->isEmpty()) {
            $this->info('No dealers need geocoding.');
            return 0;
        }

        $successCount = 0;
        $failCount = 0;

        foreach ($dealers as $dealer) {
            $this->info("Processing: {$dealer->company_name}...");

            $address = implode(', ', array_filter([
                $dealer->address,
                $dealer->city,
                $dealer->state,
                $dealer->country,
            ]));

            try {
                // Use Nominatim (OpenStreetMap) - FREE geocoding
                $response = Http::withHeaders([
                    'User-Agent' => 'Shams-Naturals-ECommerce/1.0',
                ])->timeout(10)->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $address,
                    'format' => 'json',
                    'limit' => 1,
                    'addressdetails' => 1,
                ]);

                if ($response->successful()) {
                    $results = $response->json();

                    if (!empty($results)) {
                        $location = $results[0];
                        $dealer->latitude = (float) $location['lat'];
                        $dealer->longitude = (float) $location['lon'];
                        $dealer->save();

                        $this->info("  ✓ Geocoded: {$location['lat']}, {$location['lon']}");
                        $successCount++;
                    } else {
                        $this->warn("  ✗ Geocoding failed: No results found");
                        $this->warn("    Address: {$address}");
                        $failCount++;
                    }
                } else {
                    $this->error("  ✗ API request failed");
                    $failCount++;
                }
            } catch (\Exception $e) {
                $this->error("  ✗ Exception: " . $e->getMessage());
                $failCount++;
            }

            // Nominatim usage policy: max 1 request per second
            sleep(1);
        }

        $this->newLine();
        $this->info("Geocoding completed!");
        $this->table(
            ['Result', 'Count'],
            [
                ['Successful', $successCount],
                ['Failed', $failCount],
                ['Total', $successCount + $failCount],
            ]
        );

        return 0;
    }
}

