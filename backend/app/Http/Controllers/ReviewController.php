<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\MediaItem;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function store(Request $request, $mediaId)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:0|max:100',
            'content' => 'nullable|string',
            'spoilers' => 'boolean'
        ]);

        $mediaItem = MediaItem::findOrFail($mediaId);

        $review = $mediaItem->reviews()->create([
            'user_id' => Auth::id(),
            'rating' => $validated['rating'],
            'content' => $validated['content'] ?? null,
            'spoilers' => $validated['spoilers'] ?? false,
        ]);

        return response()->json($review->load('user'), 201);
    }

    public function destroy($id)
    {
        $review = Review::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        $review->delete();
        return response()->json(['message' => 'Review deleted']);
    }
}
