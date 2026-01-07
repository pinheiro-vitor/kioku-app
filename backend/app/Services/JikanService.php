<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class JikanService
{
    protected $baseUrl = 'https://api.jikan.moe/v4';

    public function searchAnime(string $query)
    {
        $response = Http::withoutVerifying()->get("{$this->baseUrl}/anime", [
            'q' => $query,
            'limit' => 5,
        ]);

        return $response->json();
    }

    public function searchManga(string $query)
    {
        $response = Http::withoutVerifying()->get("{$this->baseUrl}/manga", [
            'q' => $query,
            'limit' => 5,
        ]);

        return $response->json();
    }
}
