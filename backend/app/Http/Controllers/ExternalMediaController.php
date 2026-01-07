<?php

namespace App\Http\Controllers;

use App\Services\JikanService;
use Illuminate\Http\Request;

class ExternalMediaController extends Controller
{
    protected $jikanService;

    public function __construct(JikanService $jikanService)
    {
        $this->jikanService = $jikanService;
    }

    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:3',
            'type' => 'required|in:anime,manga',
        ]);

        $query = $request->input('query');
        $type = $request->input('type');

        if ($type === 'anime') {
            $results = $this->jikanService->searchAnime($query);
        } else {
            $results = $this->jikanService->searchManga($query);
        }

        return response()->json($results);
    }
}
