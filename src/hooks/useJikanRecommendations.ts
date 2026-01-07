import { useState, useEffect } from 'react';
import { MediaItem } from '@/types/media';
import { jikanService } from '@/services/jikanService';

interface JikanRecommendation {
    entry: {
        mal_id: number;
        url: string;
        images: {
            jpg: {
                image_url: string;
                large_image_url: string;
            };
            webp: {
                image_url: string;
                large_image_url: string;
            };
        };
        title: string;
    };
    url: string;
    votes: number;
}

export function useJikanRecommendations(type: 'anime' | 'manga' | 'manhwa', malId?: number) {
    const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
    const [relations, setRelations] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!malId) {
            setRecommendations([]);
            return;
        }

        const fetchRecommendations = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // CONTENT-BASED RECOMMENDATION STRATEGY
                // 1. Fetch Full Details to get Genre/Demographic IDs
                // 2. Prioritize Demographics (Seinen/Josei/Shoujo/Shounen) + Main Genres
                // 3. Search for titles with matching IDs

                let fullData;
                if (type === 'anime') {
                    const res = await jikanService.getAnimeFull(malId);
                    fullData = res.data;
                } else {
                    const res = await jikanService.getMangaFull(malId);
                    fullData = res.data;
                }

                // Extract IDs
                // Prioritize explicit genres and demographics
                // We also need to check for "Ecchi" (9), "Hentai" (12), "Erotica" (49), "Harem" (35) to disable SFW filter
                // Common IDs: Action (1), Adventure (2), Comedy (4), Drama (8), Fantasy (10), Romance (22), Sci-Fi (24), Slice of Life (36), Supernatural (37)
                // Niche/Strong IDs: Ecchi (9), Hentai (12), Horror (14), Psychological (40), Thriller (41), Mystery (7), Sports (30), Mecha (18)

                const allGenres = [
                    ...fullData.genres,
                    ...fullData.explicit_genres,
                    ...fullData.themes,
                    ...fullData.demographics
                ];

                // Check if we should disable SFW
                // If rating is Rx (start with R) or has Ecchi/Hentai tags
                const isNsfw =
                    fullData.rating?.includes('Rx') ||
                    fullData.rating?.includes('Hentai') ||
                    allGenres.some(g => [9, 12, 49, 35].includes(g.mal_id));

                const sfw = !isNsfw;

                // Priority Sorting
                // We want to bubble up important tags.
                const highPriorityIds = [9, 12, 49, 14, 40, 41, 62]; // Ecchi, Hentai, Erotica, Horror, Psych, Thriller, Isekai(62)
                const mediumPriorityIds = [10, 24, 18, 22]; // Fantasy, Sci-Fi, Mecha, Romance
                // Demographics are also high priority usually
                const demographicIds = fullData.demographics.map(d => d.mal_id);

                const sortedGenres = allGenres.sort((a, b) => {
                    const aScore = (highPriorityIds.includes(a.mal_id) ? 3 : 0) + (mediumPriorityIds.includes(a.mal_id) ? 1 : 0);
                    const bScore = (highPriorityIds.includes(b.mal_id) ? 3 : 0) + (mediumPriorityIds.includes(b.mal_id) ? 1 : 0);
                    return bScore - aScore;
                });

                // Pick top 3 unique IDs
                // Ensure we include demographics if available
                const finalIds: number[] = [];

                // Always add Demographics first
                demographicIds.forEach(id => {
                    if (!finalIds.includes(id)) finalIds.push(id);
                });

                // Then add top sorted genres until we have 3-4
                sortedGenres.forEach(g => {
                    if (finalIds.length < 3 && !finalIds.includes(g.mal_id)) {
                        finalIds.push(g.mal_id);
                    }
                });

                if (finalIds.length === 0 && allGenres.length > 0) {
                    finalIds.push(allGenres[0].mal_id);
                }

                if (finalIds.length === 0) {
                    return;
                }

                // If we found IDs, search
                if (finalIds.length > 0) {
                    const relevantIds = finalIds.join(',');

                    try {
                        const searchRes = type === 'anime'
                            ? await jikanService.searchAnime('', 1, relevantIds, sfw)
                            : await jikanService.searchManga('', 1, relevantIds, sfw);

                        if (searchRes.data && searchRes.data.length > 0) {
                            const mapped = searchRes.data
                                .filter(item => item.mal_id !== malId)
                                .slice(0, 10)
                                .map(item => ({
                                    id: String(item.mal_id),
                                    malId: item.mal_id,
                                    title: item.title,
                                    type: type,
                                    coverImage: item.images.webp.large_image_url || item.images.jpg.large_image_url,
                                    status: 'plan-to-watch' as const,
                                    score: item.score || 0,
                                    synopsis: item.synopsis || '',
                                    genres: item.genres.map(g => g.name),
                                    tags: [],
                                    customLists: [],
                                    notes: '',
                                    isFavorite: false,
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                    currentEpisode: 0,
                                    totalEpisodes: 0,
                                    currentChapter: 0,
                                    totalChapters: 0,
                                    currentVolume: 0,
                                    totalVolumes: 0,
                                    rewatchCount: 0,
                                    review: '',
                                }));

                            setRecommendations(mapped);
                            return; // Success!
                        }
                    } catch (searchErr) {
                        console.warn("Smart search failed, falling back...", searchErr);
                    }
                }

                // FALLBACK: Standard Jikan Recommendations
                // If content-based failed or returned 0 results, use the /recommendations endpoint
                throw new Error("Trigger Fallback");

            } catch (err) {
                console.log("Falling back to standard recommendations due to:", err);
                // Fallback implementation
                try {
                    const response = await fetch(`https://api.jikan.moe/v4/${type === 'anime' ? 'anime' : 'manga'}/${malId}/recommendations`);
                    if (response.ok) {
                        const data = await response.json();
                        const mapped: MediaItem[] = data.data.slice(0, 10).map((item: JikanRecommendation) => ({
                            id: String(item.entry.mal_id),
                            malId: item.entry.mal_id,
                            title: item.entry.title,
                            type: type,
                            coverImage: item.entry.images.webp.large_image_url || item.entry.images.jpg.large_image_url,
                            status: 'plan-to-watch' as const,
                            score: 0,
                            synopsis: '',
                            genres: [],
                            tags: [],
                            customLists: [],
                            notes: '',
                            isFavorite: false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            currentEpisode: 0,
                            totalEpisodes: 0,
                            currentChapter: 0,
                            totalChapters: 0,
                            currentVolume: 0,
                            totalVolumes: 0,
                            rewatchCount: 0,
                            review: '',
                        }));
                        setRecommendations(mapped);
                    }
                } catch (fallbackErr) {
                    console.error("Fallback failed too", fallbackErr);
                }
            } finally {
                setIsLoading(false);
            }
        };

        const fetchRelations = async () => {
            const endpointType = type === 'anime' ? 'anime' : 'manga';
            try {
                const response = await fetch(`https://api.jikan.moe/v4/${endpointType}/${malId}/relations`);
                if (!response.ok) return; // Relations fail often if none exist, just ignore

                const data = await response.json();
                // Flatten relations
                // Jikan Relations: array of { relation: string, entry: [...] }
                const flats: any[] = [];
                data.data.forEach((rel: any) => {
                    rel.entry.forEach((entry: any) => {
                        flats.push({ ...entry, relationType: rel.relation });
                    });
                });

                const mapped: MediaItem[] = flats.map((item: any) => ({
                    id: String(item.mal_id),
                    malId: item.mal_id,
                    title: item.name, // Jikan relation uses 'name' not 'title'
                    type: item.type, // 'manga' or 'anime'
                    coverImage: '', // Relations endpoint DOES NOT return images :( We might need to fetch detailed info or just show a link
                    // Actually, for a nice UI we need images. 
                    // Strategy: We won't show images for relations immediately or use a placeholder, OR better:
                    // Just list them as links/text if no image.
                    // WAIT, the user wants "Similar" to be better. "Similar" usually means Recommendations.
                    // Relations are "Sequels".
                    // Let's keep this simple: Map what we have.
                    status: 'plan-to-watch',
                    score: 0,
                    synopsis: `Relação: ${item.relationType}`,
                    genres: [],
                    tags: [], // Using tags to store relation type for UI
                    customLists: [],
                    notes: item.relationType,
                    isFavorite: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    currentEpisode: 0,
                    totalEpisodes: 0,
                    currentChapter: 0,
                    totalChapters: 0,
                    currentVolume: 0,
                    totalVolumes: 0,
                    rewatchCount: 0,
                    review: '',
                }));
                // Filter out current item
                setRelations(mapped.filter(r => r.malId !== malId));
            } catch (err) {
                console.error(err);
            }
        }

        fetchRecommendations();
        fetchRelations();
    }, [type, malId]);

    return { recommendations, relations, isLoading, error };
}
