<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MediaItem;
use Illuminate\Support\Facades\Auth;

class MediaItemController extends Controller
{
    public function index(Request $request)
    {
        return Auth::user()->mediaItems()
            ->with([
                'customLists' => function ($query) {
                    $query->select('custom_lists.id'); // Only need IDs for frontend check
                }
            ])
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'type' => 'required|string',
            'status' => 'required|string',
            'score' => 'numeric',
            'current_episode' => 'integer',
            'total_episodes' => 'integer',
            'current_chapter' => 'integer',
            'total_chapters' => 'integer',
            'api_id' => 'nullable|integer',
            // Extended Data
            'studio' => 'nullable|string',
            'author' => 'nullable|string',
            'format' => 'nullable|string',
            'volumes' => 'integer',
            // Allow other fields safely
            'cover_image' => 'nullable|string',
            'cover_image_large' => 'nullable|string',
            'banner_image' => 'nullable|string',
            'synopsis' => 'nullable|string',
            'genres' => 'nullable|array',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        try {
            $item = Auth::user()->mediaItems()->create($validated);
            return response()->json($item, 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['message' => 'Error saving item'], 500);
        }
    }

    public function show(string $id)
    {
        return Auth::user()->mediaItems()->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $item = Auth::user()->mediaItems()->findOrFail($id);

        // Validate request just like store, but nullable for updates
        $validated = $request->validate([
            'title' => 'sometimes|string',
            'type' => 'sometimes|string',
            'status' => 'sometimes|string',
            'score' => 'numeric',
            'current_episode' => 'integer',
            'total_episodes' => 'integer',
            'current_chapter' => 'integer',
            'total_chapters' => 'integer',
            'studio' => 'nullable|string',
            'author' => 'nullable|string',
            'format' => 'nullable|string',
            'volumes' => 'integer',
            'cover_image' => 'nullable|string',
            'cover_image_large' => 'nullable|string',
            'banner_image' => 'nullable|string',
            'synopsis' => 'nullable|string',
            'genres' => 'nullable|array',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $item->update($validated);
        return response()->json($item);
    }

    public function destroy(string $id)
    {
        $item = Auth::user()->mediaItems()->findOrFail($id);
        $item->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
