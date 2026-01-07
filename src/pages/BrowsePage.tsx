import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Star, TrendingUp, BookOpen, Loader2, X, Calendar, ThumbsUp } from 'lucide-react';
import { jikanService, JikanEntry } from '@/services/jikanService';
import { MediaFormModal } from '@/components/MediaFormModal';
import { MediaItem } from '@/types/media';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { useToast } from '@/hooks/use-toast';
import { GENRE_MAP } from '@/constants/genreIds';
import { StreamingPlatformIcon } from '@/components/StreamingPlatformIcon';
import { getStreamingServices } from '@/utils/streamingUtils';

interface MediaGridProps {
    items: JikanEntry[];
    title: string;
    icon: any;
    onAdd: (item: JikanEntry) => void;
}

const MediaGrid = ({ items, title, icon: Icon, onAdd, showStreaming = false }: { items: JikanEntry[], title: string, icon: any, onAdd: (item: JikanEntry) => void, showStreaming?: boolean }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-2">
            <Icon className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {items.map((item) => {
                const streamingServices = showStreaming ? getStreamingServices(item) : [];

                return (
                    <div key={item.mal_id} className="group relative aspect-[2/3] overflow-hidden rounded-xl bg-muted transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20">
                        <img
                            src={item.images.webp.large_image_url}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />


                        {/* Streaming Badges - Bottom Right */}
                        {streamingServices.length > 0 && (
                            <div className="absolute bottom-2 right-2 flex gap-1 z-10">
                                {streamingServices.map(s => (
                                    <StreamingPlatformIcon key={s.name} platform={s.name} />
                                ))}
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <h3 className="text-white font-bold line-clamp-2 text-sm mb-1">{item.title}</h3>
                            <div className="flex items-center justify-between text-xs text-white/80 mb-3">
                                <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    {item.score || 'N/A'}
                                </span>
                                <span>{item.year || 'Unknown'}</span>
                            </div>
                            <Button
                                size="sm"
                                className="w-full gap-2 bg-primary hover:bg-primary/90 text-white border-none"
                                onClick={() => onAdd(item)}
                            >
                                <Plus className="h-4 w-4" />
                                Adicionar
                            </Button>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
);

// Skeleton Component for loading states
const SkeletonMediaGrid = () => (
    <div className="space-y-6">
        <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-muted animate-pulse rounded-full" />
            <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
            ))}
        </div>
    </div>
);

export default function BrowsePage() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [seasonNow, setSeasonNow] = useState<JikanEntry[]>([]);
    const [recommendations, setRecommendations] = useState<JikanEntry[]>([]);
    const [trendingAnime, setTrendingAnime] = useState<JikanEntry[]>([]);
    const [trendingManga, setTrendingManga] = useState<JikanEntry[]>([]);

    // Per-section loading states
    const [loadingStates, setLoadingStates] = useState({
        season: true,
        recs: true,
        anime: true,
        manga: true
    });

    // Error states
    const [errorStates, setErrorStates] = useState({
        season: false,
        recs: false,
        anime: false,
        manga: false
    });

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [searchResults, setSearchResults] = useState<JikanEntry[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const [selectedItem, setSelectedItem] = useState<Partial<MediaItem> | undefined>(undefined);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { addItem } = useMediaLibrary();
    const { toast } = useToast();

    // Debounce Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Search Effect
    useEffect(() => {
        const performSearch = async () => {
            if (!debouncedQuery.trim()) {
                if (!titleOverride) {
                    setSearchResults([]);
                    setShowDropdown(false);
                }
                return;
            }

            setTitleOverride('');
            setIsSearching(true);
            setShowDropdown(true);

            try {
                const [animeRes, mangaRes] = await Promise.all([
                    jikanService.searchAnime(debouncedQuery),
                    jikanService.searchManga(debouncedQuery)
                ]);

                const combined = [
                    ...animeRes.data.slice(0, 5),
                    ...mangaRes.data.slice(0, 5)
                ];

                setSearchResults(combined);
            } catch (error) {
                console.error('Search failed:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        performSearch();
    }, [debouncedQuery]);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Deduplicate items by mal_id
    const deduplicateItems = (items: JikanEntry[]) => {
        const seen = new Set();
        return items.filter(item => {
            const duplicate = seen.has(item.mal_id);
            seen.add(item.mal_id);
            return !duplicate;
        });
    };

    const fetchSection = async (section: keyof typeof loadingStates) => {
        setLoadingStates(prev => ({ ...prev, [section]: true }));
        setErrorStates(prev => ({ ...prev, [section]: false }));

        try {
            if (section === 'season') {
                const seasonRes = await jikanService.getSeasonNow();
                const majorPlatforms = ['netflix', 'crunchyroll', 'hidive', 'disney', 'amazon', 'prime', 'hulu', 'bilibili'];
                const filtered = seasonRes.data.filter(item => {
                    const allSources = [
                        ...(item.streaming || []).map(s => s.name),
                        ...(item.licensors || []).map(s => s.name)
                    ].join(' ').toLowerCase();
                    const hasMajor = majorPlatforms.some(p => allSources.includes(p));
                    const isPopular = (item.members || 0) > 30000;
                    return hasMajor || isPopular;
                });
                setSeasonNow(deduplicateItems(filtered).slice(0, 18));
            } else if (section === 'recs') {
                const recsRes = await jikanService.getRecentRecommendations();
                setRecommendations(deduplicateItems(recsRes.data).slice(0, 18));
            } else if (section === 'anime') {
                const animeRes = await jikanService.getTopAnime();
                setTrendingAnime(deduplicateItems(animeRes.data).slice(0, 12));
            } else if (section === 'manga') {
                const mangaRes = await jikanService.getTopManga();
                setTrendingManga(deduplicateItems(mangaRes.data).slice(0, 12));
            }
        } catch (error) {
            console.error(`Failed to fetch ${section}`, error);
            setErrorStates(prev => ({ ...prev, [section]: true }));
        } finally {
            setLoadingStates(prev => ({ ...prev, [section]: false }));
        }
    };

    useEffect(() => {
        const fetchAll = async () => {
            // Sequential waterfall to be gentle on API
            await fetchSection('season');
            await new Promise(r => setTimeout(r, 1000));
            await fetchSection('recs');
            await new Promise(r => setTimeout(r, 1000));
            await fetchSection('anime');
            await new Promise(r => setTimeout(r, 1000));
            await fetchSection('manga');
        };
        fetchAll();
    }, []);

    // URL params effect
    const [titleOverride, setTitleOverride] = useState('');

    useEffect(() => {
        const q = searchParams.get('q');
        const genre = searchParams.get('genre');

        if (genre) {
            const id = GENRE_MAP[genre];
            if (id) {
                setSearchQuery('');
                setDebouncedQuery('');
                setIsSearching(true);
                setTitleOverride(`Gênero: ${genre}`);

                Promise.all([
                    jikanService.searchAnime('', 1, String(id)),
                    jikanService.searchManga('', 1, String(id))
                ]).then(([animeRes, mangaRes]) => {
                    const combined = [
                        ...animeRes.data,
                        ...mangaRes.data
                    ];
                    setSearchResults(combined);
                }).catch(err => {
                    console.error("Genre search failed", err);
                }).finally(() => {
                    setIsSearching(false);
                });
            }
        } else if (q) {
            setTitleOverride('');
            setSearchQuery(q);
        } else {
            if (!searchQuery) {
                setTitleOverride('');
                setSearchResults([]);
            }
        }
    }, [searchParams]);

    const handleAddToLibrary = (entry: JikanEntry) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const mappedItem: Partial<MediaItem> = {
            malId: entry.mal_id,
            title: entry.title,
            titleOriginal: entry.title_japanese,
            type: entry.type === 'Manga' || entry.type === 'Manhwa' || entry.type === 'Novel' ? 'manga' : 'anime',
            coverImage: entry.images.webp.image_url || entry.images.jpg.image_url,
            coverImageLarge: entry.images.webp.large_image_url || entry.images.jpg.large_image_url,
            synopsis: entry.synopsis || '',
            score: entry.score ? entry.score : 0,
            totalEpisodes: entry.episodes || 0,
            totalChapters: entry.chapters || 0,
            totalVolumes: entry.volumes || 0,
            releaseYear: entry.year || (entry.published?.from ? new Date(entry.published.from).getFullYear() : new Date().getFullYear()),
            status: 'plan-to-watch',
            genres: entry.genres.map(g => g.name),
            author: entry.authors?.[0]?.name,
            studio: entry.studios?.[0]?.name,
            tags: [],
            customLists: [],
            notes: '',
            review: '',
            isFavorite: false,
            rewatchCount: 0,
            startDate: '',
            endDate: '',
        };

        setSelectedItem(mappedItem);
        setIsFormOpen(true);
        setShowDropdown(false);
    };

    const handleFormSubmit = (data: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>) => {
        addItem(data);
        setIsFormOpen(false);
        toast({
            title: 'Adicionado com sucesso',
            description: `"${data.title}" foi adicionado à sua biblioteca.`,
            duration: 3000,
        });
    };

    const renderSection = (key: keyof typeof loadingStates, items: JikanEntry[], title: string, Icon: any, showStream = false, extra?: React.ReactNode) => {
        if (loadingStates[key]) return <SkeletonMediaGrid />;
        if (errorStates[key]) return (
            <div className="flex flex-col items-center justify-center py-12 bg-destructive/10 rounded-xl border border-destructive/20">
                <p className="text-destructive font-medium mb-4">Falha ao carregar {title.toLowerCase()}</p>
                <Button variant="outline" onClick={() => fetchSection(key)} className="gap-2">
                    <Loader2 className="h-4 w-4" /> Tentar Novamente
                </Button>
            </div>
        );

        return (
            <>
                <MediaGrid
                    items={items}
                    title={title}
                    icon={Icon}
                    onAdd={handleAddToLibrary}
                    showStreaming={showStream}
                />
                {extra}
            </>
        );
    };

    return (
        <div className="min-h-screen text-foreground">
            <main className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
                {/* Simplified Header for Browser */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
                        Explorar
                    </h1>
                    <p className="text-muted-foreground">
                        Busque novos títulos e adicione à sua coleção.
                    </p>
                </div>

                {/* Search Bar - Moved to top of content */}
                <div ref={searchRef} className="max-w-2xl relative z-20">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar animes, mangás..."
                            className="h-12 pl-12 pr-12 bg-card border-input focus:border-primary shadow-sm"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value) setShowDropdown(true);
                            }}
                            onFocus={() => {
                                if (searchResults.length > 0 || isSearching) setShowDropdown(true);
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setDebouncedQuery('');
                                    setSearchResults([]);
                                    setShowDropdown(false);
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                </div>

                {isSearching ? (
                    <div className="flex justify-center py-20 animate-fade-in">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (searchResults.length > 0 || titleOverride) ? (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Search className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-bold tracking-tight">
                                {titleOverride || `Resultados para "${debouncedQuery}"`}
                            </h2>
                        </div>

                        {searchResults.length > 0 ? (
                            <MediaGrid
                                items={searchResults}
                                title=""
                                icon={Search}
                                onAdd={handleAddToLibrary}
                            />
                        ) : (
                            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
                                <p className="text-muted-foreground text-lg mb-4">Nenhum resultado encontrado.</p>
                                <Button
                                    variant="outline"
                                    onClick={() => setSearchQuery('')}
                                >
                                    Limpar busca e ver recomendações
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Tabs defaultValue="season" className="space-y-8">
                        <div className="flex justify-start">
                            <TabsList className="grid w-full max-w-2xl grid-cols-4">
                                <TabsTrigger value="season">Temporada</TabsTrigger>
                                <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                                <TabsTrigger value="anime">Top Animes</TabsTrigger>
                                <TabsTrigger value="manga">Top Mangás</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="season" className="animate-fade-in">
                            {renderSection('season', seasonNow, "Temporada Atual (Principais)", Calendar, true)}
                        </TabsContent>

                        <TabsContent value="recommendations" className="animate-fade-in">
                            {renderSection('recs', recommendations, "Recomendações Recentes", ThumbsUp, false,
                                <p className="text-muted-foreground text-sm mt-4 italic text-center">
                                    * Baseado nos lançamentos mais aguardados da comunidade.
                                </p>
                            )}
                        </TabsContent>

                        <TabsContent value="anime" className="animate-fade-in">
                            {renderSection('anime', trendingAnime, "Animes em Alta", TrendingUp)}
                        </TabsContent>

                        <TabsContent value="manga" className="animate-fade-in">
                            {renderSection('manga', trendingManga, "Mangás Populares", BookOpen)}
                        </TabsContent>
                    </Tabs>
                )}
            </main>

            {/* Media Form Modal for adding items */}
            <MediaFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedItem as MediaItem}
                mode="add"
            />
        </div>
    );
}
