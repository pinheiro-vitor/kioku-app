<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\MediaItem;
use App\Models\CustomList;

class MediaSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure we have a user
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Create Default Items
        $items = [
            [
                'title' => 'Violet Evergarden',
                'title_original' => 'ヴァイオレット・エヴァーガーデン',
                'type' => 'anime',
                'cover_image' => 'https://cdn.myanimelist.net/images/anime/1795/95088l.jpg',
                'status' => 'completed',
                'score' => 10,
                'current_episode' => 13,
                'total_episodes' => 13,
                'synopsis' => 'A história de uma garota que aprendeu o significado do amor através das cartas que escreve. Violet Evergarden busca entender as últimas palavras de seu major.',
                'review' => 'Uma obra-prima visual e emocional. Kyoto Animation no seu melhor. A animação é de tirar o fôlego e a história toca o coração.',
                'genres' => ['Drama', 'Fantasia', 'Slice of Life'],
                'tags' => ['Emocional', 'Pós-Guerra', 'Crescimento'],
                'studio' => 'Kyoto Animation',
                'release_year' => 2018,
                'season' => 'Inverno',
                'age_rating' => 'PG-13',
                'trailer_url' => 'https://www.youtube.com/watch?v=BUfSen2rZQg',
                'start_date' => '2024-01-15',
                'end_date' => '2024-02-10',
                'rewatch_count' => 2,
                'is_favorite' => true,
                'notes' => 'Assistir os filmes também',
            ],
            [
                'title' => 'Solo Leveling',
                'title_original' => '나 혼자만 레벨업',
                'type' => 'manhwa',
                'cover_image' => 'https://cdn.myanimelist.net/images/manga/3/222295l.jpg',
                'status' => 'reading',
                'score' => 9,
                'current_chapter' => 150,
                'total_chapters' => 200,
                'current_volume' => 12,
                'total_volumes' => 16,
                'synopsis' => 'Sung Jin-Woo, o caçador mais fraco, descobre um poder misterioso que o permite evoluir sem limites.',
                'review' => 'Arte incrível e progressão de poder satisfatória. O protagonista é muito carismático.',
                'genres' => ['Ação', 'Fantasia', 'Aventura'],
                'tags' => ['Power Fantasy', 'Dungeons', 'System'],
                'author' => 'Chugong',
                'release_year' => 2018,
                'age_rating' => 'PG-13',
                'start_date' => '2024-03-01',
                'is_favorite' => true,
            ],
            [
                'title' => 'Chainsaw Man',
                'title_original' => 'チェンソーマン',
                'type' => 'manga',
                'cover_image' => 'https://cdn.myanimelist.net/images/manga/3/216464l.jpg',
                'status' => 'reading',
                'score' => 10,
                'current_chapter' => 120,
                'total_chapters' => 180,
                'current_volume' => 10,
                'total_volumes' => 15,
                'synopsis' => 'Denji faz um pacto com um demônio motosserra e se torna um caçador de demônios em troca de uma vida melhor.',
                'review' => 'Fujimoto é um gênio. Caos puro e narrativa única. Os personagens são memoráveis.',
                'genres' => ['Ação', 'Horror', 'Sobrenatural'],
                'tags' => ['Gore', 'Dark', 'Anti-herói'],
                'author' => 'Tatsuki Fujimoto',
                'release_year' => 2018,
                'age_rating' => 'R',
                'trailer_url' => 'https://www.youtube.com/watch?v=vyIOZvPwvkU',
                'start_date' => '2024-02-20',
                'rewatch_count' => 1,
                'is_favorite' => false,
                'notes' => 'Parte 2 em andamento',
            ],
            [
                'title' => 'Frieren: Beyond Journey\'s End',
                'title_original' => '葬送のフリーレン',
                'type' => 'anime',
                'cover_image' => 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
                'status' => 'watching',
                'score' => 9,
                'current_episode' => 20,
                'total_episodes' => 28,
                'synopsis' => 'Após derrotar o Rei Demônio, a elfa Frieren parte em uma jornada para entender os humanos que tanto a marcaram.',
                'review' => 'Anime contemplativo e profundo sobre o tempo e as conexões humanas.',
                'genres' => ['Aventura', 'Drama', 'Fantasia'],
                'tags' => ['Melancólico', 'Elfos', 'Jornada'],
                'studio' => 'Madhouse',
                'release_year' => 2023,
                'season' => 'Outono',
                'age_rating' => 'PG-13',
                'start_date' => '2024-04-01',
                'is_favorite' => true,
            ]
        ];

        foreach ($items as $itemData) {
            $user->mediaItems()->create($itemData);
        }

        // Create Custom Lists
        $lists = [
            [
                'name' => 'Favoritos',
                'description' => 'Minhas obras favoritas de todos os tempos',
                'icon' => 'Heart',
                'color' => '#ef4444',
                'items_titles' => ['Violet Evergarden', 'Solo Leveling', 'Frieren: Beyond Journey\'s End']
            ],
            [
                'name' => 'Top Ação',
                'description' => 'Melhores títulos de ação',
                'icon' => 'Zap',
                'color' => '#f97316',
                'items_titles' => ['Solo Leveling', 'Chainsaw Man']
            ]
        ];

        foreach ($lists as $listData) {
            $itemsToAttach = $listData['items_titles'];
            unset($listData['items_titles']);

            $list = $user->customLists()->create($listData);

            // Find items by title and attach
            foreach ($itemsToAttach as $title) {
                $media = $user->mediaItems()->where('title', $title)->first();
                if ($media) {
                    $list->items()->attach($media->id);
                }
            }
        }
    }
}
