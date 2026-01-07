import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MediaItem, MediaStatus } from '@/types/media';
import { useToast } from '@/hooks/use-toast';
import { MediaDetailModal } from '@/components/MediaDetailModal';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaCard } from '@/components/MediaCard';
import { FeaturedHero } from '@/components/FeaturedHero';
import { Play, BookOpen, TrendingUp, Clock, Activity, Star } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function DashboardPage() {
    const { user } = useAuth();
    const {
        items,
        isLoaded,
        getStatistics,
        updateItem,
        deleteItem,
        toggleFavorite,
        getRecommendations,
        addItemToList,
        removeItemFromList,
        customLists
    } = useMediaLibrary();
    const { theme } = useTheme();
    const { toast } = useToast();

    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const stats = getStatistics();

    // Data for charts
    const statusData = [
        { name: 'Em Progresso', value: stats.watchingItems, color: '#f59e0b' }, // amber-500
        { name: 'Completo', value: stats.completedItems, color: '#22c55e' }, // green-500
        { name: 'Pausado', value: stats.statusDistribution.find(s => s.status === 'Em Pausa')?.count || 0, color: '#eab308' }, // yellow-500
        { name: 'Planejado', value: stats.statusDistribution.find(s => s.status === 'Planejado')?.count || 0, color: '#3b82f6' }, // blue-500
        { name: 'Abandonado', value: stats.droppedItems, color: '#ef4444' } // red-500
    ].filter(d => d.value > 0);

    const scoreData = stats.scoreDistribution.filter(d => d.count > 0);

    // Filter "Continue Watching" items (Watching/Reading) sort by updatedAt
    const continueWatching = items
        .filter(item => (item.status === 'watching' || item.status === 'reading') && (item.currentEpisode > 0 || item.currentChapter > 0))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

    // Recent activity (updated items)
    const recentActivity = items
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

    // Filter Top 5 Highest Rated Items for Hero Carousel
    const heroItems = items
        .filter(item => item.score > 0) // Only rated items
        .sort((a, b) => b.score - a.score) // Highest score first
        .slice(0, 5);

    // Fallback: If no rated items, take random 5 or recent 5
    const carouselItems = heroItems.length > 0 ? heroItems : items.slice(0, 5);

    const handleCardClick = (item: MediaItem) => {
        setSelectedItem(item);
        setIsDetailModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        await deleteItem(selectedItem.id);
        setIsDetailModalOpen(false);
        setSelectedItem(null);
        toast({ title: "Item excluído", description: "Item removido da biblioteca com sucesso." });
    };

    const handleUpdateStatus = async (status: MediaStatus) => {
        if (!selectedItem) return;
        updateItem(selectedItem.id, { status });
        setSelectedItem(prev => prev ? { ...prev, status } : null);
    };

    const handleUpdateProgress = async (progress: number) => {
        if (!selectedItem) return;
        const field = ['manga', 'manhwa', 'novel'].includes(selectedItem.type) ? 'currentChapter' : 'currentEpisode';
        updateItem(selectedItem.id, { [field]: progress });
        setSelectedItem(prev => prev ? { ...prev, [field]: progress } : null);
    };

    const handleToggleFavorite = async () => {
        if (!selectedItem) return;
        toggleFavorite(selectedItem.id);
        setSelectedItem(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    };

    const handleUpdateScore = async (score: number) => {
        if (!selectedItem) return;
        updateItem(selectedItem.id, { score });
        setSelectedItem(prev => prev ? { ...prev, score } : null);
    };

    const handleSelectRecommendation = (item: MediaItem) => {
        setIsDetailModalOpen(false);
        setTimeout(() => {
            setSelectedItem(item);
            setIsDetailModalOpen(true);
        }, 150);
    };

    const handleAddToList = async (listId: string) => {
        if (!selectedItem) return;
        addItemToList(listId, selectedItem.id);
    };

    const handleRemoveFromList = async (listId: string) => {
        if (!selectedItem) return;
        removeItemFromList(listId, selectedItem.id);
    };

    return (
        <div className="container mx-auto p-6 space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                        Olá, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Aqui está o resumo da sua biblioteca hoje.
                    </p>
                </div>
            </header>

            {/* Hero Carousel Section */}
            {carouselItems.length > 0 && (
                <FeaturedHero
                    items={carouselItems}
                    onPlay={(item) => handleCardClick(item)}
                    onMoreInfo={(item) => handleCardClick(item)}
                />
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Itens Totais</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalItems}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalAnime} animes, {stats.totalManga} mangás
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tempo de Vida</CardTitle>
                        <Clock className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDays}d {stats.totalHours % 24}h</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalEpisodes} episódios assistidos
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
                        <Star className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageScore.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Média de {items.filter(i => i.score > 0).length} itens avaliados
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gênero Favorito</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-ellipsis overflow-hidden whitespace-nowrap">
                            {stats.topGenres[0]?.[0] || 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.topGenres[0]?.[1] || 0} títulos nesta categoria
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Continue Watching Section */}
            {continueWatching.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Play className="h-5 w-5 text-primary" /> Continuar Assistindo
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {continueWatching.map((item, index) => (
                            <MediaCard
                                key={item.id}
                                item={item}
                                index={index}
                                onClick={() => handleCardClick(item)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Content & Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 h-[400px]">
                    <CardHeader>
                        <CardTitle>Últimas Atualizações</CardTitle>
                        <CardDescription>Itens que você interagiu recentemente</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px] w-full pr-4">
                            <div className="space-y-4">
                                {recentActivity.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="h-12 w-8 bg-cover bg-center rounded-sm shrink-0"
                                                style={{ backgroundImage: `url(${item.coverImage})` }}
                                            />
                                            <div>
                                                <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.type === 'anime' ? (
                                                        <>Episódio {item.currentEpisode} / {item.totalEpisodes || '?'}</>
                                                    ) : (
                                                        <>Capítulo {item.currentChapter} / {item.totalChapters || '?'}</>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xs font-bold px-2 py-1 rounded-full 
                                                ${item.status === 'completed' ? 'bg-green-500/20 text-green-600' :
                                                    item.status === 'watching' || item.status === 'reading' ? 'bg-yellow-500/20 text-yellow-600' :
                                                        'bg-secondary text-muted-foreground'}`}>
                                                {item.status === 'watching' ? 'Assistindo' : item.status === 'reading' ? 'Lendo' : item.status === 'completed' ? 'Completo' : item.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {recentActivity.length === 0 && (
                                    <p className="text-center text-muted-foreground py-10">Nenhuma atividade recente.</p>
                                )}
                            </div>
                            <ScrollBar orientation="vertical" />
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Status Distribution Chart */}
                <Card className="h-[400px]">
                    <CardHeader>
                        <CardTitle>Distribuição</CardTitle>
                        <CardDescription>Status da sua biblioteca</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex flex-col justify-between">
                        {statusData.length > 0 ? (
                            <div className="relative flex-1 min-h-0">
                                {/* Center Label */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-bold font-display tracking-tighter">{stats.totalItems}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Total</span>
                                </div>

                                <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                            cornerRadius={6}
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" className="hover:opacity-80 transition-opacity cursor-pointer" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-lg outline-none flex flex-col gap-1 min-w-[120px]">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: data.color }} />
                                                                <span className="font-medium text-popover-foreground text-sm">{data.name}</span>
                                                            </div>
                                                            <div className="flex items-baseline gap-1 pl-4.5">
                                                                <span className="text-2xl font-bold tracking-tight text-foreground">{payload[0].value}</span>
                                                                <span className="text-xs text-muted-foreground font-medium">itens</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                            cursor={false}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted flex items-center justify-center">
                                    <Activity className="h-5 w-5 opacity-50" />
                                </div>
                                <span className="text-sm font-medium">Sem dados ainda</span>
                            </div>
                        )}

                        {/* Custom Legend */}
                        {statusData.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {statusData.map(d => (
                                    <div key={d.name} className="flex items-center gap-2 bg-secondary/30 rounded-lg p-2 text-xs font-medium transition-colors hover:bg-secondary/50">
                                        <div className="w-2 h-2 rounded-full ring-2 ring-background shrink-0" style={{ backgroundColor: d.color }} />
                                        <span className="truncate flex-1">{d.name}</span>
                                        <span className="text-muted-foreground tabular-nums">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>



            {/* Modals */}
            {
                selectedItem && (
                    <MediaDetailModal
                        item={selectedItem}
                        isOpen={isDetailModalOpen}
                        onClose={() => setIsDetailModalOpen(false)}
                        onEdit={() => { }} // Not implemented in dashboard for now
                        onDelete={handleDelete}
                        onUpdateStatus={handleUpdateStatus}
                        onUpdateProgress={handleUpdateProgress}
                        onToggleFavorite={handleToggleFavorite}
                        onUpdateScore={handleUpdateScore}
                        recommendations={getRecommendations(selectedItem.id)}
                        onSelectRecommendation={handleSelectRecommendation}
                        customLists={customLists}
                        onAddToList={handleAddToList}
                        onRemoveFromList={handleRemoveFromList}
                    />
                )
            }
        </div >
    );
}
