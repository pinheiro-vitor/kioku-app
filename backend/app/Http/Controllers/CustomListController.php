<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomList;
use Illuminate\Support\Facades\Auth;

class CustomListController extends Controller
{
    public function index()
    {
        return Auth::user()->customLists()->with('mediaItems:id')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $list = Auth::user()->customLists()->create($validated);
        return response()->json($list, 201);
    }

    public function update(Request $request, string $id)
    {
        $list = Auth::user()->customLists()->findOrFail($id);
        $list->update($request->only(['name', 'description', 'icon', 'color']));
        return response()->json($list);
    }

    public function destroy(string $id)
    {
        $list = Auth::user()->customLists()->findOrFail($id);
        $list->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function addMedia(Request $request, string $id)
    {
        $list = Auth::user()->customLists()->findOrFail($id);
        $mediaId = $request->input('media_id');

        // Ensure media belongs to user
        $media = Auth::user()->mediaItems()->findOrFail($mediaId);

        $list->mediaItems()->syncWithoutDetaching([$mediaId]);

        return response()->json(['message' => 'Added']);
    }

    public function removeMedia(Request $request, string $id, string $mediaId)
    {
        $list = Auth::user()->customLists()->findOrFail($id);
        $list->mediaItems()->detach($mediaId);
        return response()->json(['message' => 'Removed']);
    }
}
