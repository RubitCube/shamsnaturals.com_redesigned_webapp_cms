<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\State;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StateController extends Controller
{
    public function index(Request $request, Country $country)
    {
        $perPage = (int) $request->input('per_page', 10);
        $perPage = $perPage > 0 ? min($perPage, 100) : 10;

        $query = State::where('country_id', $country->id)->orderBy('name');

        if ($search = $request->input('search')) {
            $query->where('name', 'like', '%' . $search . '%');
        }

        $states = $query->paginate($perPage);

        return response()->json([
            'data' => $states->items(),
            'meta' => [
                'current_page' => $states->currentPage(),
                'last_page' => $states->lastPage(),
                'per_page' => $states->perPage(),
                'total' => $states->total(),
            ],
            'country' => $country,
        ]);
    }

    public function store(Request $request, Country $country)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('states', 'name')->where(function ($query) use ($country) {
                    return $query->where('country_id', $country->id);
                }),
            ],
            'is_active' => 'nullable',
        ]);

        $validated['country_id'] = $country->id;
        $validated['slug'] = $this->generateSlug($validated['name'], $country->id);
        $validated['is_active'] = $request->has('is_active')
            ? filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN)
            : true;

        $state = State::create($validated);

        return response()->json($state, 201);
    }

    public function show(State $state)
    {
        return response()->json($state->load('country'));
    }

    public function update(Request $request, State $state)
    {
        $countryId = $request->input('country_id', $state->country_id);
        $country = Country::findOrFail($countryId);

        $validated = $request->validate([
            'country_id' => ['nullable', 'exists:countries,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('states', 'name')
                    ->where(fn ($query) => $query->where('country_id', $country->id))
                    ->ignore($state->id),
            ],
            'is_active' => 'nullable',
        ]);

        $validated['country_id'] = $country->id;

        if ($state->name !== $validated['name'] || $state->country_id !== $country->id) {
            $validated['slug'] = $this->generateSlug($validated['name'], $country->id, $state->id);
        }

        if ($request->has('is_active')) {
            $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        $state->update($validated);

        return response()->json($state->fresh('country'));
    }

    public function destroy(State $state)
    {
        $state->delete();

        return response()->json(['message' => 'State deleted successfully.']);
    }

    public function toggleStatus(State $state)
    {
        $state->is_active = !$state->is_active;
        $state->save();

        return response()->json($state);
    }

    private function generateSlug(string $name, int $countryId, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        if (empty($slug)) {
            $slug = Str::random(8);
        }

        $baseSlug = $slug;
        $counter = 1;

        while (
            State::where('slug', $slug)
                ->where('country_id', $countryId)
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

