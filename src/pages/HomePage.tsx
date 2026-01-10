import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { JikanAnime, getSeasonalAnime } from '@/services/jikan';
import { MediaCard } from '@/components/MediaCard';
import { MediaItem } from '@/types/media';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Play, Calendar, Clock, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
    const { user } = useAuth();
    const { items, updateItem } = useMediaLibrary();
    const [seasonalAnime, setSeasonalAnime] = useState<JikanAnime[]>([]);
    const [loadingSeasonal, setLoadingSeasonal] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSeasonal = async () => {
            try {
                const data = await getSeasonalAnime();
                setSeasonalAnime(data.slice(0, 15)); // Limit to 15 items
            } catch (error) {
                console.error("Failed to fetch seasonal anime", error);
            } finally {
                setLoadingSeasonal(false);
            }
        };
        fetchSeasonal();
    }, []);

    // Filter "Continue Watching"
    const continueWatching = items
        .filter(item => (item.status === 'watching' || item.status === 'reading') && (item.currentEpisode > 0 || item.currentChapter > 0))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10);

    // Recently Added
    const recentlyAdded = items
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

    const handleQuickAddProgress = (e: React.MouseEvent, item: MediaItem) => {
        e.stopPropagation();
        const field = ['manga', 'manhwa', 'novel'].includes(item.type) ? 'currentChapter' : 'currentEpisode';
        const newValue = (item[field] || 0) + 1;

        updateItem(item.id, { [field]: newValue });

        toast({
            title: "Progresso atualizado",
            description: `+1 ${field === 'currentChapter' ? 'Capítulo' : 'Episódio'} para ${item.title}`,
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-12 pb-20 animate-fade-in">
            {/* Header */}
            <header className="space-y-2">
                <h1 className="text-4xl font-display font-bold text-foreground">
                    Olá, {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-muted-foreground text-lg">
                    Bem-vindo de volta ao Kioku.
                </p>
            </header>

            {/* Continue Watching Section */}
            {continueWatching.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Play className="h-5 w-5 text-primary fill-primary/20" />
                        <h2 className="text-2xl font-display font-bold">Continuar Assistindo</h2>
                    </div>
                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {continueWatching.map((item) => (
                                <CarouselItem key={item.id} className="pl-2 md:pl-4 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                                    <div className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-kioku transition-all hover:scale-[1.02]" onClick={() => navigate('/library')}>
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                            style={{ backgroundImage: `url(${item.coverImage})` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                className="h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                                                onClick={(e) => handleQuickAddProgress(e, item)}
                                                title="Adicionar +1"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <h3 className="font-semibold text-white line-clamp-1 mb-1">{item.title}</h3>
                                            <div className="flex items-center justify-between text-xs text-white/70">
                                                <span>
                                                    {item.type === 'anime' ? 'Ep ' : 'Cap '}
                                                    <span className="text-white font-bold text-base">
                                                        {item.type === 'anime' ? item.currentEpisode : item.currentChapter}
                                                    </span>
                                                </span>
                                                <span className="capitalize">{item.type}</span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{
                                                        width: `${Math.min(100, (((item.type === 'anime' ? item.currentEpisode : item.currentChapter) / (item.type === 'anime' ? (item.totalEpisodes || 12) : (item.totalChapters || 100))) * 100))}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </section>
            )}

            {/* Seasonal Releases Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-accent" />
                    <h2 className="text-2xl font-display font-bold">Temporada Atual</h2>
                </div>
                {loadingSeasonal ? (
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} className="h-[280px] w-[200px] rounded-xl shrink-0" />
                        ))}
                    </div>
                ) : (
                    <Carousel
                        opts={{ align: "start" }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {seasonalAnime.map((anime) => (
                                <CarouselItem key={anime.mal_id} className="pl-2 md:pl-4 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                                    <a
                                        href={anime.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block group relative aspect-[2/3] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                            style={{ backgroundImage: `url(${anime.images.webp.large_image_url})` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <h3 className="font-semibold text-white text-sm line-clamp-2 leading-tight mb-1">
                                                {anime.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-white/20 text-white backdrop-blur-sm border-0">
                                                    {anime.score ? anime.score : 'N/A'}
                                                </Badge>
                                                <span className="text-[10px] text-white/70 truncate">
                                                    {anime.episodes ? `${anime.episodes} eps` : 'Em lançamento'}
                                                </span>
                                            </div>
                                        </div>
                                    </a>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                )}
            </section>

            {/* Recently Added Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-display font-bold">Adicionados Recentemente</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {recentlyAdded.map((item, index) => (
                        <MediaCard
                            key={item.id}
                            item={item}
                            index={index}
                            onClick={() => navigate('/library')} // Or open detail modal if I import logic
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
