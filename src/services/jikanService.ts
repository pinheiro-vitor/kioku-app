import axios from 'axios';

const BASE_URL = 'https://api.jikan.moe/v4';

// Create a dedicated axios instance for Jikan to avoid sending Auth headers
const jikanClient = axios.create({
    baseURL: BASE_URL,
});

// Remove Authorization header from this instance just in case
delete jikanClient.defaults.headers.common['Authorization'];

// Rate limiting helper (simple delay)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface JikanResponse<T> {
    data: T;
    pagination: {
        last_visible_page: number;
        has_next_page: boolean;
        current_page: number;
        items: {
            count: number;
            total: number;
            per_page: number;
        };
    };
}

export interface JikanImage {
    jpg: {
        image_url: string;
        small_image_url: string;
        large_image_url: string;
    };
    webp: {
        image_url: string;
        small_image_url: string;
        large_image_url: string;
    };
}

export interface JikanEntry {
    mal_id: number;
    url: string;
    images: JikanImage;
    title: string;
    title_english: string;
    title_japanese: string;
    type: string;
    source: string;
    episodes: number | null;
    chapters: number | null;
    volumes: number | null;
    status: string;
    airing: boolean;
    publishing: boolean;
    published: {
        from: string | null;
        to: string | null;
        prop: {
            from: { day: number | null; month: number | null; year: number | null };
            to: { day: number | null; month: number | null; year: number | null };
        };
        string: string | null;
    };
    score: number | null;
    scored_by: number | null;
    rank: number | null;
    popularity: number | null;
    members: number | null;
    favorites: number | null;
    synopsis: string | null;
    background: string | null;
    season: string | null;
    year: number | null;
    studios: { name: string }[];
    authors: { name: string }[];
    genres: { mal_id: number; name: string }[];
    explicit_genres: { mal_id: number; name: string }[];
    themes: { mal_id: number; name: string }[];
    demographics: { mal_id: number; name: string }[];
    licensors?: { name: string; url: string }[];
    streaming?: { name: string; url: string }[];
}

export interface JikanCharacter {
    character: {
        mal_id: number;
        url: string;
        images: {
            webp: {
                image_url: string;
            };
        };
        name: string;
    };
    role: string;
    voice_actors: {
        person: {
            mal_id: number;
            url: string;
            images: {
                jpg: {
                    image_url: string;
                };
            };
            name: string;
        };
        language: string;
    }[];
}

export interface JikanRelation {
    relation: string;
    entry: {
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }[];
}

export const jikanService = {
    async searchAnime(query: string, page = 1, genres?: string, sfw = true): Promise<JikanResponse<JikanEntry[]>> {
        await delay(350); // Jikan rate limit buffer
        const params: any = { q: query, page, sfw };
        if (genres) params.genres = genres;

        const response = await jikanClient.get('/anime', { params });
        return response.data;
    },

    async searchManga(query: string, page = 1, genres?: string, sfw = true): Promise<JikanResponse<JikanEntry[]>> {
        await delay(350);
        const params: any = { q: query, page, sfw };
        if (genres) params.genres = genres;

        const response = await jikanClient.get('/manga', { params });
        return response.data;
    },

    async getTopAnime(page = 1): Promise<JikanResponse<JikanEntry[]>> {
        await delay(350);
        const response = await jikanClient.get('/top/anime', {
            params: { page, filter: 'bypopularity' }
        });
        return response.data;
    },

    async getTopManga(page = 1): Promise<JikanResponse<JikanEntry[]>> {
        await delay(350);
        const response = await jikanClient.get('/top/manga', {
            params: { page, filter: 'bypopularity' }
        });
        return response.data;
    },

    async getSeasonNow(page = 1): Promise<JikanResponse<JikanEntry[]>> {
        await delay(350);
        const response = await jikanClient.get('/seasons/now', {
            params: { page }
        });
        return response.data;
    },

    async getAnimeCharacters(id: number): Promise<JikanResponse<JikanCharacter[]>> {
        await delay(350);
        const response = await jikanClient.get(`/anime/${id}/characters`);
        return response.data;
    },

    async getAnimeRelations(id: number): Promise<{ data: JikanRelation[] }> {
        await delay(350);
        const response = await jikanClient.get(`/anime/${id}/relations`);
        return response.data;
    },

    async getRecentRecommendations(page = 1): Promise<JikanResponse<JikanEntry[]>> {
        await delay(350);
        // Using /seasons/upcoming as a proxy for "Trending/Upcoming Recommendations" due to Type compatibility
        const response = await jikanClient.get('/seasons/upcoming', {
            params: { page }
        });
        return response.data;
    },

    async getAnimeFull(id: number): Promise<{ data: JikanEntry }> {
        await delay(350);
        const response = await jikanClient.get(`/anime/${id}/full`);
        return response.data;
    },

    async getMangaFull(id: number): Promise<{ data: JikanEntry }> {
        await delay(350);
        const response = await jikanClient.get(`/manga/${id}/full`);
        return response.data;
    }
};
