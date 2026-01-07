<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Comment;
use App\Models\MediaItem;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'media_item_id' => 'required|exists:media_items,id',
            'content' => 'required|string',
        ]);

        $mediaItem = MediaItem::findOrFail($request->media_item_id);

        // Ensure user owns the media item? Or can users comment on others' items?
        // Based on the app description, it seems personal library, so likely only own items.
        if ($mediaItem->user_id !== Auth::id()) {
            abort(403);
        }

        $comment = $mediaItem->comments()->create([
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);

        return response()->json($comment, 201);
    }

    public function destroy(Comment $comment)
    {
        if ($comment->user_id !== Auth::id()) {
            abort(403);
        }

        $comment->delete();

        return response()->noContent();
    }
}
