<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;

class CalendarEntryController extends Controller
{
    public function index()
    {
        return Auth::user()->calendarEntries()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'day_of_week' => 'required|string',
            'image' => 'nullable|string',
            'streaming' => 'nullable|array',
            'time' => 'nullable|string',
        ]);

        $entry = Auth::user()->calendarEntries()->create($validated);
        return response()->json($entry, 201);
    }

    public function update(Request $request, string $id)
    {
        $entry = Auth::user()->calendarEntries()->findOrFail($id);

        $entry->update($request->only([
            'title',
            'day_of_week',
            'image',
            'streaming',
            'time'
        ]));

        return response()->json($entry);
    }

    public function destroy(string $id)
    {
        $entry = Auth::user()->calendarEntries()->findOrFail($id);
        $entry->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
