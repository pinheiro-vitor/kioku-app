<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048', // 2MB Max
        ]);

        $user = Auth::user();
        $file = $request->file('avatar');

        // Delete old avatar if exists? Optional.

        $path = $file->storePublicly('avatars', 'public');

        // URL generation (requires php artisan storage:link)
        $url = asset('storage/' . $path);

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            ['avatar_url' => $url]
        );

        return response()->json(['url' => $url]);
    }

    public function show()
    {
        return Auth::user()->load('profile');
    }
}
