export interface JikanAnime {
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
    title_english: string;
    title_japanese: string;
    type: string;
    episodes: number;
    status: string;
    score: number;
    synopsis: string;
    year: number;
    genres: { name: string }[];
}

export async function getSeasonalAnime(): Promise<JikanAnime[]> {
    try {
        const response = await fetch('https://api.jikan.moe/v4/seasons/now?sfw');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching seasonal anime:', error);
        return [];
    }
}
