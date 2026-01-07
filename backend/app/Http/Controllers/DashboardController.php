<?php

namespace App\Http\Controllers;

use App\Models\MediaItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $stats = [
            'total_anime' => MediaItem::where('user_id', $userId)->where('type', 'anime')->count(),
            'total_manga' => MediaItem::where('user_id', $userId)->where('type', 'manga')->count(),
            'completed' => MediaItem::where('user_id', $userId)->where('status', 'completed')->count(),
            'in_progress' => MediaItem::where('user_id', $userId)->whereIn('status', ['watching', 'reading'])->count(),
        ];

        $recent_activity = MediaItem::where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_activity' => $recent_activity
        ]);
    }
}
