<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CountryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $perPage = $perPage > 0 ? min($perPage, 100) : 10;

        $query = Country::withCount('states')->orderBy('name');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('code', 'like', '%' . $search . '%');
            });
        }

        $countries = $query->paginate($perPage);

        return response()->json($countries);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:countries,name',
            'code' => 'nullable|string|max:10',
            'is_active' => 'nullable',
        ]);

        $validated['slug'] = $this->generateSlug($validated['name']);
        $validated['is_active'] = $request->has('is_active')
            ? filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN)
            : true;

        $country = Country::create($validated);

        return response()->json($country, 201);
    }

    public function show(Country $country)
    {
        return response()->json($country->loadCount('states'));
    }

    public function update(Request $request, Country $country)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('countries', 'name')->ignore($country->id),
            ],
            'code' => 'nullable|string|max:10',
            'is_active' => 'nullable',
        ]);

        if ($country->name !== $validated['name']) {
            $validated['slug'] = $this->generateSlug($validated['name'], $country->id);
        }

        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        $country->update($validated);

        return response()->json($country);
    }

    public function destroy(Country $country)
    {
        if ($country->states()->exists()) {
            return response()->json([
                'message' => 'Cannot delete country with associated states.'
            ], 422);
        }

        $country->delete();

        return response()->json(['message' => 'Country deleted successfully.']);
    }

    public function toggleStatus(Country $country)
    {
        $country->is_active = !$country->is_active;
        $country->save();

        return response()->json($country);
    }

    private function generateSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        if (empty($slug)) {
            $slug = Str::random(8);
        }

        $baseSlug = $slug;
        $counter = 1;

        while (
            Country::where('slug', $slug)
                ->when($ignoreId, function ($query) use ($ignoreId) {
                    $query->where('id', '!=', $ignoreId);
                })
                ->exists()
        ) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}

