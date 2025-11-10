<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Dealer;
use Illuminate\Http\Request;

class DealerController extends Controller
{
    public function index()
    {
        $dealers = Dealer::where('is_active', true)
            ->orderBy('country')
            ->orderBy('state')
            ->get();

        return response()->json($dealers);
    }

    public function byCountry($country)
    {
        $dealers = Dealer::where('country', $country)
            ->where('is_active', true)
            ->orderBy('state')
            ->get();

        return response()->json($dealers);
    }

    public function byState($country, $state)
    {
        $dealers = Dealer::where('country', $country)
            ->where('state', $state)
            ->where('is_active', true)
            ->get();

        return response()->json($dealers);
    }
}

