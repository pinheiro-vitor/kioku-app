<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\CustomList;
use Illuminate\Support\Facades\Auth;

class CustomListController extends Controller
{
    public function index()
    {
        return Auth::user()->customLists()->with('mediaItems')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'required|string',
            'color' => 'required|string',
        ]);

        $customList = Auth::user()->customLists()->create($request->all());

        if ($request->has('media_item_ids')) {
            $customList->mediaItems()->sync($request->media_item_ids);
        }

        return response()->json($customList->load('mediaItems'), 201);
    }

    public function show(CustomList $customList)
    {
        if ($customList->user_id !== Auth::id()) {
            abort(403);
        }
        return $customList->load('mediaItems');
    }

    public function update(Request $request, CustomList $customList)
    {
        if ($customList->user_id !== Auth::id()) {
            abort(403);
        }

        $customList->update($request->except('media_item_ids'));

        if ($request->has('media_item_ids')) {
            $customList->mediaItems()->sync($request->media_item_ids);
        }

        return $customList->load('mediaItems');
    }

    public function destroy(CustomList $customList)
    {
        if ($customList->user_id !== Auth::id()) {
            abort(403);
        }

        $customList->delete();

        return response()->noContent();
    }
}
