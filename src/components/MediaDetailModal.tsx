import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  X, BookOpen, Eye, Pause, Trash2, Edit, Heart, Play,
  Calendar, Clock, User, Building, Star, ExternalLink,
  ChevronRight, Plus, Minus, RefreshCw, Film, Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MediaItem, TYPE_LABELS, STATUS_LABELS, MediaStatus, AGE_RATING_LABELS, CustomList } from '@/types/media';
import { Button } from '@/components/ui/button';
import { ScoreInput, ScoreSlider } from './ScoreInput';
import { CircularProgress } from './CircularProgress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useJikanRecommendations } from '@/hooks/useJikanRecommendations';
import { CharacterList } from './CharacterList';

interface MediaDetailModalProps {
  item: MediaItem;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateStatus: (status: MediaStatus) => void;
  onUpdateProgress: (progress: number) => void;
  onToggleFavorite: () => void;
  onUpdateScore: (score: number) => void;
  recommendations?: MediaItem[];
  onSelectRecommendation?: (item: MediaItem) => void;
  customLists?: CustomList[];
  onAddToList?: (listId: string) => void;
  onRemoveFromList?: (listId: string) => void;
}

export function MediaDetailModal({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
  onUpdateProgress,
  onToggleFavorite,
  onUpdateScore,
  recommendations = [],
  onSelectRecommendation,
  customLists = [],
  onAddToList,
  onRemoveFromList,
}: MediaDetailModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  // const { recommendations: jikanRecs, relations: jikanRelations, isLoading: isLoadingRecs } = useJikanRecommendations(item.type, item.malId);
  const navigate = useNavigate();

  // Prefer Jikan recommendations if available
  // const displayRecommendations = jikanRecs.length > 0 ? jikanRecs : recommendations;

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Use a safer check or cast to avoid "no overlap" errors if the type union is discriminated improperly elsewhere or just strictly typed
  const isAnime = ['anime', 'movie', 'ona', 'ova', 'special'].includes(item.type as string);

  const current = isAnime ? (item.currentEpisode || 0) : (item.currentChapter || 0);
  const total = isAnime ? (item.totalEpisodes || 0) : (item.totalChapters || 0);

  // Calculate percentage for the linear progress bar
  const validTotal = total ? Number(total) : 0;
  const validCurrent = current ? Number(current) : 0;
  const percentage = Math.min(100, Math.max(0, validTotal > 0 ? (validCurrent / validTotal) * 100 : 0));

  const handleProgressChange = (amount: number) => {
    const newProgress = Math.max(0, current + amount);
    if (total > 0 && newProgress > total) return;

    // Fix: Use onUpdateProgress prop, not updateProgress from store (which requires ID)
    onUpdateProgress(newProgress);
  };

  // Removed old handleProgressIncrement and handleProgressDecrement

  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in relative">
        {/* Actions Buttons - Absolute Top Right */}
        <div className="absolute top-4 right-4 flex gap-2 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 backdrop-blur-sm rounded-full shadow-sm transition-all duration-300 hover:scale-105"
            title="Excluir"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="bg-card/80 backdrop-blur-sm hover:bg-card text-foreground hover:text-foreground rounded-full shadow-sm transition-all duration-300 hover:scale-105 border border-transparent hover:border-border/50"
            title="Editar"
          >
            <Edit className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            className={cn(
              'bg-card/80 backdrop-blur-sm hover:bg-card text-foreground hover:text-foreground rounded-full shadow-sm transition-all duration-300 hover:scale-105 border border-transparent hover:border-border/50',
              item.isFavorite && 'text-accent hover:text-accent'
            )}
            title={item.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart className={cn('h-5 w-5', item.isFavorite && 'fill-current')} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="bg-card/80 backdrop-blur-sm hover:bg-card text-foreground hover:text-foreground rounded-full shadow-sm transition-all duration-300 hover:scale-105 border border-transparent hover:border-border/50"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row h-[500px] md:h-[600px] overflow-hidden bg-background/50">
          {/* Cover Image - Left Side */}
          <div className="md:w-1/3 p-6 flex flex-col gap-4 items-center justify-center shrink-0 border-r border-border/50">
            <div className="relative w-full max-w-[280px] aspect-[2/3] rounded-2xl overflow-hidden shadow-xl bg-muted/30">
              {!isImageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
              <img
                src={item.coverImageLarge || item.coverImage}
                alt={item.title}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-500",
                  isImageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setIsImageLoaded(true)}
              />
            </div>

            {/* Progress Controls */}
            <div className="w-full max-w-[280px] flex flex-col gap-3">
              <div className="flex items-center justify-between bg-secondary/30 rounded-full p-1 border border-white/5 shadow-inner">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-secondary/50 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProgressChange(-1);
                  }}
                  disabled={current === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="flex flex-col items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {!isAnime ? 'Capítulos' : 'Episódios'}
                  </span>
                  <span className="text-lg font-bold font-display leading-none">
                    {current} {validTotal > 0 && <span className="text-muted-foreground text-base font-normal">/ {total}</span>}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-secondary/50 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProgressChange(1);
                  }}
                  disabled={total > 0 && current >= total}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress / Last Read Info */}
              <div className="w-full px-1">
                {validTotal > 0 ? (
                  <>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5 px-1">
                      <span className="font-medium">Progresso</span>
                      <span className="font-mono">{Math.round(percentage)}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={cn(
                          "h-full transition-all duration-500 ease-out shadow-sm relative overflow-hidden",
                          percentage >= 100 ? "bg-accent" : "bg-primary"
                        )}
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground py-2 mt-1 bg-secondary/20 rounded-lg">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {isAnime ? 'Assistido' : 'Lido'} há{' '}
                      {formatDistanceToNow(new Date(item.updatedAt), {
                        addSuffix: false,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content - Right Side */}
          <div className="md:w-2/3 p-6 flex flex-col gap-4 h-full overflow-y-auto pt-8 md:pt-6">
            {/* Title and Header Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className="bg-primary text-primary-foreground">
                  {TYPE_LABELS[item.type]}
                </Badge>
                {item.ageRating && (
                  <Badge variant="outline">{AGE_RATING_LABELS[item.ageRating]}</Badge>
                )}
                {item.season && item.releaseYear && (
                  <Badge variant="secondary">
                    {item.season} {item.releaseYear}
                  </Badge>
                )}
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-card-foreground leading-tight">
                {item.title}
              </h2>
              {item.titleOriginal && (
                <p className="text-muted-foreground mt-1 text-lg">{item.titleOriginal}</p>
              )}
              {item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir Fonte
                </a>
              )}

              {/* Genres */}
              {item.genres && item.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.genres.map((genre) => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => {
                        onClose();
                        navigate(`/browse?genre=${encodeURIComponent(genre)}`);
                      }}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
            </div>



            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Info</TabsTrigger>
                {isAnime && <TabsTrigger value="cast">Elenco</TabsTrigger>}
                <TabsTrigger value="review">Review</TabsTrigger>
                <TabsTrigger value="lists">Listas</TabsTrigger>
                {/* <TabsTrigger value="recommendations">Recomendações</TabsTrigger> */}
              </TabsList>

              <TabsContent value="info" className="space-y-6 mt-4">
                {/* Synopsis - Full width */}
                <div className="space-y-2">
                  <h3 className="font-display text-lg text-card-foreground">Sinopse</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {item.synopsis || "Sem sinopse disponível."}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-secondary/20 p-4 rounded-2xl">
                  {item.studio && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building className="h-3.5 w-3.5" />
                        <span>Estúdio</span>
                      </div>
                      <p className="font-medium text-sm text-card-foreground truncate">{item.studio}</p>
                    </div>
                  )}
                  {item.author && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>Autor</span>
                      </div>
                      <p className="font-medium text-sm text-card-foreground truncate">{item.author}</p>
                    </div>
                  )}
                  {item.releaseYear && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Ano</span>
                      </div>
                      <p className="font-medium text-sm text-card-foreground">{item.releaseYear}</p>
                    </div>
                  )}
                  {/* Total Volumes / Seasons context */}
                  {!isAnime && (item.totalVolumes || 0) > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Volumes</span>
                      </div>
                      <p className="font-medium text-sm text-card-foreground">{item.totalVolumes}</p>
                    </div>
                  )}
                  {isAnime && (item.totalEpisodes || 0) > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Film className="h-3.5 w-3.5" />
                        <span>Episódios</span>
                      </div>
                      <p className="font-medium text-sm text-card-foreground">{item.totalEpisodes} (TV)</p>
                    </div>
                  )}
                  {item.startDate && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Início</span>
                      </div>
                      <p className="font-medium text-sm text-card-foreground">
                        {new Date(item.startDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                  {item.endDate && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Fim</span>
                      </div>
                      <p className="font-medium text-sm text-card-foreground">
                        {new Date(item.endDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                  {/* Age Rating can go here too if needed */}
                </div>

                {/* External Links */}
                {(item.trailerUrl || item.openingUrl || item.endingUrl) && (
                  <div className="flex flex-wrap gap-2">
                    {item.trailerUrl && (
                      <a
                        href={item.trailerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Play className="h-4 w-4" />
                        Trailer
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {item.openingUrl && (
                      <a
                        href={item.openingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        Opening
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {item.endingUrl && (
                      <a
                        href={item.endingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        Ending
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </TabsContent>

              {isAnime && (
                <TabsContent value="cast" className="mt-4 h-full overflow-y-auto pr-2">
                  <CharacterList malId={item.malId!} />
                </TabsContent>
              )}

              <TabsContent value="review" className="space-y-4 mt-4">
                {item.review ? (
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <h3 className="font-display text-xl text-card-foreground mb-2">Minha Review</h3>
                    <p className="text-secondary-foreground leading-relaxed italic">
                      "{item.review}"
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma review ainda. Edite para adicionar.
                  </p>
                )}

                {item.notes && (
                  <div className="bg-muted/50 rounded-xl p-4">
                    <h3 className="font-display text-lg text-card-foreground mb-2">Notas</h3>
                    <p className="text-muted-foreground text-sm">{item.notes}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lists" className="space-y-3 mt-4">
                {customLists.map((list) => {
                  const isInList = item.customLists.includes(list.id);
                  return (
                    <div
                      key={list.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl border transition-colors',
                        isInList ? 'border-primary bg-primary/10' : 'border-border'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: list.color + '20' }}
                        >
                          <span style={{ color: list.color }}>♦</span>
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{list.name}</p>
                          <p className="text-xs text-muted-foreground">{list.description}</p>
                        </div>
                      </div>
                      <Button
                        variant={isInList ? 'outline' : 'default'}
                        size="sm"
                        onClick={() =>
                          isInList
                            ? onRemoveFromList?.(list.id)
                            : onAddToList?.(list.id)
                        }
                      >
                        {isInList ? 'Remover' : 'Adicionar'}
                      </Button>
                    </div>
                  );
                })}
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-display text-lg text-card-foreground mb-3">Status</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={item.status === 'completed' ? 'gradient' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateStatus('completed')}
                  className={cn(
                    "group transition-all duration-500 ease-in-out !rounded-full !px-0 !gap-0",
                    item.status === 'completed' && "shadow-lg scale-105"
                  )}
                >
                  <div className="w-9 h-9 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 group-hover:pr-3 overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap">
                    {item.status === 'completed'
                      ? (isAnime ? 'Assistido' : 'Lido')
                      : `Marcar como ${isAnime ? 'Assistido' : 'Lido'}`
                    }
                  </span>
                </Button>

                <Button
                  variant={(item.status === 'watching' || item.status === 'reading') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateStatus(isAnime ? 'watching' : 'reading')}
                  className={cn(
                    "group transition-all duration-500 ease-in-out !rounded-full !px-0 !gap-0",
                    (item.status === 'watching' || item.status === 'reading') && "bg-primary text-primary-foreground shadow-md"
                  )}
                >
                  <div className="w-9 h-9 flex items-center justify-center shrink-0">
                    <Eye className="h-4 w-4" />
                  </div>
                  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 group-hover:pr-3 overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap">
                    {item.status === 'watching' || item.status === 'reading'
                      ? (isAnime ? 'Assistindo' : 'Lendo')
                      : (isAnime ? 'Assistir' : 'Ler')
                    }
                  </span>
                </Button>

                <Button
                  variant={item.status === 'on-hold' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateStatus('on-hold')}
                  className={cn(
                    "group transition-all duration-500 ease-in-out !rounded-full !px-0 !gap-0",
                    item.status === 'on-hold' && "shadow-md"
                  )}
                >
                  <div className="w-9 h-9 flex items-center justify-center shrink-0">
                    <Pause className="h-4 w-4" />
                  </div>
                  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 group-hover:pr-3 overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap">
                    Em Pausa
                  </span>
                </Button>
                <Button
                  variant={item.status === 'plan-to-watch' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateStatus('plan-to-watch')}
                  className={cn(
                    "group transition-all duration-500 ease-in-out !rounded-full !px-0 !gap-0",
                    item.status === 'plan-to-watch' && "shadow-md bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                  )}
                >
                  <div className="w-9 h-9 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 group-hover:pr-3 overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap">
                    Planejado
                  </span>
                </Button>

                <Button
                  variant={item.status === 'dropped' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => onUpdateStatus('dropped')}
                  className={cn(
                    "group transition-all duration-500 ease-in-out !rounded-full !px-0 !gap-0",
                    item.status === 'dropped' && "shadow-md bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  )}
                >
                  <div className="w-9 h-9 flex items-center justify-center shrink-0">
                    <X className="h-4 w-4" />
                  </div>
                  <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 group-hover:pr-3 overflow-hidden transition-all duration-500 ease-in-out whitespace-nowrap">
                    Abandonado
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
