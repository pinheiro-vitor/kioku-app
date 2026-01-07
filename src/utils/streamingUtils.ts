import { JikanEntry } from '@/services/jikanService';

// Manual overrides for popular ongoing/recent anime that might miss data in Jikan
// Keys can be MAL IDs (number) or Title (string) matches.
// Using Title partial match is riskier but covers more cases without needing exact IDs.
// We will use a combination: Exact ID preference, then Title includes.

const MANUAL_OVERRIDES_BY_TITLE: Record<string, string[]> = {
    // Fall 2024 / Winter 2025 Highlights (Brazil Focus)
    "Dandadan": ["Crunchyroll", "Netflix"],
    "Bleach": ["Disney+"], // Disney+ exclusive in LATAM usually
    "Ranma": ["Netflix"],
    "Dragon Ball Daima": ["Crunchyroll", "Netflix", "Max"],
    "Blue Lock": ["Crunchyroll"],
    "Shangri-La Frontier": ["Crunchyroll"],
    "Re:Zero": ["Crunchyroll"],
    "Solo Leveling": ["Crunchyroll"],
    "Sword Art Online": ["Crunchyroll"],
    "Sakamoto Days": ["Netflix"],
    "Blue Box": ["Netflix"],
    "Ao no Hako": ["Netflix"],
    "Orb: On the Movements of the Earth": ["Netflix"],
    "Chi": ["Netflix"],
    "Uzumaki": ["Max"], // HBO Max in Brazil
    "Spy x Family": ["Crunchyroll"],
    "Chainsaw Man": ["Crunchyroll"],
    "Oshi no Ko": ["Hidive", "Netflix"], // Hidive/Netflix check
    "Mushoku Tensei": ["Crunchyroll"],
    "Frieren": ["Crunchyroll"],
    "Tower of God": ["Crunchyroll"],
    "Fairy Tail": ["Crunchyroll"],
    "My Hero Academia": ["Crunchyroll", "Netflix"],
    "DanMachi": ["Hidive", "Netflix"], // Sometimes Netflix has delay
    "Is It Wrong to Try to Pick Up Girls in a Dungeon": ["Hidive"],
    "Eminence in Shadow": ["Hidive"],
    "Dr. Stone": ["Crunchyroll", "Netflix"],
    "Fire Force": ["Crunchyroll", "Prime Video"],
    "Kaguya-sama": ["Crunchyroll"],
    "Konosuba": ["Crunchyroll"],
    "Overlord": ["Crunchyroll"],
    "Delicious in Dungeon": ["Netflix"],
    "Dungeon Meshi": ["Netflix"],
    "Tengoku Daimakyou": ["Disney+"], // Star+/Disney+ in BR
    "Heavenly Delusion": ["Disney+"],
    "Code Geass": ["Disney+", "Crunchyroll"],
    "Sand Land": ["Disney+"],
    "Ishura": ["Disney+"],
    "The Fable": ["Disney+"],
    "Mission: Yozakura Family": ["Disney+"],
    "Go! Go! Loser Ranger!": ["Disney+"],
    "Rurouni Kenshin": ["Crunchyroll"],
    "Prince of Tennis": ["Crunchyroll"],
    "Natsume Yujin-cho": ["Crunchyroll"],
    "Natsume": ["Crunchyroll"],
    "Seirei Gensouki": ["Crunchyroll"],
    "Spirit Chronicles": ["Crunchyroll"],
    "Arifureta": ["Crunchyroll"],
    "MF Ghost": ["Crunchyroll"],
    "Trillion Game": ["Crunchyroll"],
    "Meitantei Conan": ["Crunchyroll", "Netflix", "Max"],
    "Detective Conan": ["Crunchyroll", "Netflix", "Max"],
    "One Piece": ["Crunchyroll", "Netflix"],

    // User Specific Request
    "Kimi to Koete Koi ni Naru": ["Crunchyroll"], // As per user report
    "Kimi to Koete": ["Crunchyroll"],
};

export interface StreamingService {
    name: string;
    url: string;
    color: string;
    short: string;
}

export const getStreamingServices = (item: {
    streaming?: { name: string; url: string }[];
    licensors?: { name: string; url: string }[];
    title?: string;
}): StreamingService[] => {
    const services: StreamingService[] = [];

    // 1. Gather sources from Jikan
    const apiSources = [
        ...(item.streaming || []).map(s => s.name),
        ...(item.licensors || []).map(s => s.name)
    ];

    // 2. Gather sources from Manual Overrides
    const title = item.title || "";
    let manualSources: string[] = [];

    // Check for keyword matches in title
    Object.keys(MANUAL_OVERRIDES_BY_TITLE).forEach(key => {
        if (title.toLowerCase().includes(key.toLowerCase())) {
            manualSources.push(...MANUAL_OVERRIDES_BY_TITLE[key]);
        }
    });

    // Combine and deduplicate
    const allSources = Array.from(new Set([...apiSources, ...manualSources]));

    const hasService = (name: string) => allSources.some(s => s?.toLowerCase().includes(name.toLowerCase()));

    // Map to specific platform objects
    if (hasService('Netflix')) services.push({ name: 'Netflix', url: '', color: '#E50914', short: 'N' });
    if (hasService('Crunchyroll')) services.push({ name: 'Crunchyroll', url: '', color: '#F47521', short: 'CR' });
    if (hasService('Disney') || hasService('Disney+')) services.push({ name: 'Disney+', url: '', color: '#113CCF', short: 'D+' });
    if (hasService('Hidive')) services.push({ name: 'Hidive', url: '', color: '#00AEEF', short: 'H' });
    if (hasService('Amazon') || hasService('Prime')) services.push({ name: 'Prime Video', url: '', color: '#00A8E1', short: 'P' });
    if (hasService('Hulu')) services.push({ name: 'Hulu', url: '', color: '#1CE783', short: 'Hu' });
    if (hasService('Bilibili')) services.push({ name: 'Bilibili', url: '', color: '#00A1D6', short: 'B' });
    if (hasService('Max') || hasService('HBO')) services.push({ name: 'Max', url: '', color: '#002BE7', short: 'M' });

    return services;
};
