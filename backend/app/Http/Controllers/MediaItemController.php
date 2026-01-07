<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\MediaItem;
use Illuminate\Support\Facades\Auth;

class MediaItemController extends Controller
{
    public function index()
    {
        // Return all media items for the authenticated user
        // If no user is logged in (dev mode), return all or empty? 
        // For strict "good practices", we expect auth.
        // But for ease of testing without auth setup, maybe I should allow all?
        // No, let's stick to Auth::id() and if it fails, I'll fix it.
        // Actually, for the initial setup, I'll return all if Auth::id() is null to make it easier to test?
        // No, "boas práticas".

        if (!Auth::check()) {
            // For development simplicity if auth isn't fully set up on frontend yet
            // return MediaItem::all(); 
            // But let's assume we want to be correct.
            // I'll return empty if not logged in, or 401 via middleware.
            // Let's assume the route will be protected by sanctum.
        }

        return Auth::user()->mediaItems()->with('comments', 'customLists')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:anime,manga,manhwa',
            'status' => 'required|in:watching,reading,completed,on-hold,dropped,plan-to-watch',
            'cover_image' => 'required|string',
            'source_url' => 'nullable|url',
            'cover_image_large' => 'nullable|string',
            'userStreaming' => 'nullable|array', // Frontend sends this
        ]);

        $data = $request->all();
        if (isset($data['userStreaming'])) {
            $data['user_streaming'] = $data['userStreaming'];
            unset($data['userStreaming']);
        }

        if (isset($data['mal_id'])) {
            // Find existing item by MAL ID for this user
            // We use first() to avoid crashing if multiple duplicates already exist
            $existing = Auth::user()->mediaItems()->where('mal_id', $data['mal_id'])->first();

            if ($existing) {
                // Update existing item
                $existing->update($data);
                return response()->json($existing, 200);
            }
        }

        // Create new item if not found
        $mediaItem = Auth::user()->mediaItems()->create($data);

        return response()->json($mediaItem, 201);
    }

    public function show(MediaItem $mediaItem)
    {
        if ($mediaItem->user_id !== Auth::id()) {
            abort(403);
        }
        return $mediaItem->load('comments', 'customLists');
    }

    public function update(Request $request, MediaItem $mediaItem)
    {
        if ($mediaItem->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'mal_id' => 'nullable|integer',
            'title' => 'sometimes|required|string|max:255',
            'title_original' => 'nullable|string|max:255',
            'source_url' => 'nullable|string',
            'type' => 'sometimes|required|in:anime,manga,manhwa',
            'status' => 'sometimes|required|in:watching,reading,completed,on-hold,dropped,plan-to-watch',
            'cover_image' => 'sometimes|required|string',
            'banner_image' => 'nullable|string',
            'cover_image_large' => 'nullable|string',
            'score' => 'nullable|numeric|between:0,10',
            'current_episode' => 'nullable|numeric',
            'total_episodes' => 'nullable|numeric',
            'current_chapter' => 'nullable|numeric',
            'total_chapters' => 'nullable|numeric',
            'current_volume' => 'nullable|numeric',
            'total_volumes' => 'nullable|numeric',
            'synopsis' => 'nullable|string',
            'review' => 'nullable|string',
            'genres' => 'nullable|array',
            'tags' => 'nullable|array',
            'studio' => 'nullable|string',
            'author' => 'nullable|string',
            'release_year' => 'nullable|integer',
            'season' => 'nullable|string',
            'age_rating' => 'nullable|string',
            'trailer_url' => 'nullable|string',
            'opening_url' => 'nullable|string',
            'ending_url' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'rewatch_count' => 'nullable|integer',
            'is_favorite' => 'boolean',
            'notes' => 'nullable|string',
            'broadcast_day' => 'nullable|string',
            'userStreaming' => 'nullable|array', // Frontend sends this
        ]);

        $data = $validated;

        // Handle user_streaming special case
        if (isset($data['userStreaming'])) {
            $data['user_streaming'] = $data['userStreaming'];
            unset($data['userStreaming']);
        }

        // Ensure user_id cannot be changed via mass assignment (though strict validation above already excludes it)
        // We only pass $data to update, which contains only validated keys.

        $mediaItem->update($data);

        return $mediaItem;
    }

    public function destroy(MediaItem $mediaItem)
    {
        if ($mediaItem->user_id !== Auth::id()) {
            abort(403);
        }

        $mediaItem->delete();

        return response()->noContent();
    }
}
