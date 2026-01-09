import { useState, useEffect } from 'react';

import { X } from 'lucide-react';
import { MediaItem, MediaType, MediaStatus, AgeRating, TYPE_LABELS, STATUS_LABELS, AGE_RATING_LABELS, GENRES, SEASONS, DAYS_OF_WEEK } from '@/types/media';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScoreSlider } from './ScoreInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { StreamingPlatformIcon } from '@/components/StreamingPlatformIcon';

interface MediaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: MediaItem;
  mode: 'add' | 'edit';
}

const defaultFormData: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '',
  titleOriginal: '',
  sourceUrl: '',
  type: 'anime',
  format: '',
  coverImage: '',
  coverImageLarge: '',
  bannerImage: '',
  status: 'plan-to-watch',
  score: 0,
  currentEpisode: 0,
  totalEpisodes: 12,
  currentChapter: 0,
  totalChapters: 0,
  currentVolume: 0,
  totalVolumes: 0,
  synopsis: '',
  review: '',
  genres: [],
  tags: [],
  studio: '',
  author: '',
  releaseYear: new Date().getFullYear(),
  season: '',
  broadcastDay: '',
  ageRating: 'PG-13',
  trailerUrl: '',
  openingUrl: '',
  endingUrl: '',
  startDate: '',
  endDate: '',
  rewatchCount: 0,
  isFavorite: false,
  customLists: [],
  notes: '',
  userStreaming: [],
};

// Internal state type to allow string inputs for decimals (handling "25,5" etc.)
type FormState = Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt' | 'currentEpisode' | 'totalEpisodes' | 'currentChapter' | 'totalChapters' | 'currentVolume' | 'totalVolumes'> & {
  currentEpisode: string | number;
  totalEpisodes: string | number;
  currentChapter: string | number;
  totalChapters: string | number;
  currentVolume: string | number;
  totalVolumes: string | number;
};

export function MediaFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: MediaFormModalProps) {
  const [formData, setFormData] = useState<FormState>(defaultFormData);
  const [genresInput, setGenresInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        titleOriginal: initialData.titleOriginal || '',
        sourceUrl: initialData.sourceUrl || '',
        type: initialData.type,
        format: initialData.format || '',
        coverImage: initialData.coverImage,
        coverImageLarge: initialData.coverImageLarge || '',
        bannerImage: initialData.bannerImage || '',
        status: initialData.status,
        score: initialData.score,
        currentEpisode: initialData.currentEpisode,
        totalEpisodes: initialData.totalEpisodes,
        currentChapter: initialData.currentChapter,
        totalChapters: initialData.totalChapters,
        currentVolume: initialData.currentVolume,
        totalVolumes: initialData.totalVolumes,
        synopsis: initialData.synopsis,
        review: initialData.review,
        genres: initialData.genres,
        tags: initialData.tags,
        studio: initialData.studio || '',
        author: initialData.author || '',
        releaseYear: initialData.releaseYear || new Date().getFullYear(),
        season: initialData.season || '',
        broadcastDay: initialData.broadcastDay || '',
        ageRating: initialData.ageRating || 'PG-13',
        trailerUrl: initialData.trailerUrl || '',
        openingUrl: initialData.openingUrl || '',
        endingUrl: initialData.endingUrl || '',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        rewatchCount: initialData.rewatchCount,
        isFavorite: initialData.isFavorite,
        customLists: initialData.customLists,
        notes: initialData.notes,
        userStreaming: initialData.userStreaming || [],
      });
      setTagsInput(initialData.tags.join(', '));
    } else {
      setFormData(defaultFormData);
      setGenresInput('');
      setTagsInput('');
    }
    setActiveTab('basic');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Parse decimal strings back to numbers for submission
    const parseFlexible = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return 0;
      if (typeof val === 'number') return val;
      return parseFloat(val.toString().replace(',', '.')) || 0;
    };

    const submissionData = {
      ...formData,
      currentEpisode: parseFlexible(formData.currentEpisode),
      totalEpisodes: parseFlexible(formData.totalEpisodes),
      currentChapter: parseFlexible(formData.currentChapter),
      totalChapters: parseFlexible(formData.totalChapters),
      currentVolume: parseFlexible(formData.currentVolume),
      totalVolumes: parseFlexible(formData.totalVolumes),
      tags
    };

    onSubmit(submissionData as unknown as Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleGenre = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const toggleStreaming = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      userStreaming: (prev.userStreaming || []).includes(platform)
        ? (prev.userStreaming || []).filter((p) => p !== platform)
        : [...(prev.userStreaming || []), platform],
    }));
  };

  const PLATFORMS = [
    'Netflix', 'Crunchyroll', 'Disney+', 'Prime Video', 'HBO Max', 'Pirata'
  ];

  const isAnime = formData.type === 'anime';

  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="font-display text-2xl text-card-foreground">
            {mode === 'add' ? 'Adicionar Novo' : 'Editar'} Item
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" type="button">Básico</TabsTrigger>
                <TabsTrigger value="progress" type="button">Progresso</TabsTrigger>
                <TabsTrigger value="details" type="button">Detalhes</TabsTrigger>
                <TabsTrigger value="media" type="button">Mídia</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 min-h-[500px]">
              <TabsContent value="basic" className="space-y-5 mt-0">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-card-foreground">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nome do anime/mangá/manhwa"
                    required
                    className="rounded-xl"
                  />
                </div>

                {/* Original Title */}
                <div className="space-y-2">
                  <Label htmlFor="titleOriginal" className="text-card-foreground">Título Original</Label>
                  <Input
                    id="titleOriginal"
                    value={formData.titleOriginal}
                    onChange={(e) => setFormData({ ...formData, titleOriginal: e.target.value })}
                    placeholder="日本語タイトル"
                    className="rounded-xl"
                  />
                </div>

                {/* Source URL */}
                <div className="space-y-2">
                  <Label htmlFor="sourceUrl" className="text-card-foreground">Link da Fonte (Scan/Site)</Label>
                  <Input
                    id="sourceUrl"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    placeholder="https://sakuramangas.org/manga/..."
                    className="rounded-xl"
                  />
                </div>

                {/* Type and Status Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Tipo *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: MediaType) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-card-foreground">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: MediaStatus) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Format Row */}
                <div className="space-y-2">
                  <Label className="text-card-foreground">Formato</Label>
                  <Select
                    value={formData.format || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, format: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Selecione...</SelectItem>
                      {formData.type === 'anime' ? (
                        <>
                          <SelectItem value="TV">TV</SelectItem>
                          <SelectItem value="Movie">Filme</SelectItem>
                          <SelectItem value="OVA">OVA</SelectItem>
                          <SelectItem value="ONA">ONA</SelectItem>
                          <SelectItem value="Special">Especial</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Manga">Mangá</SelectItem>
                          <SelectItem value="One-shot">One-shot</SelectItem>
                          <SelectItem value="Light Novel">Light Novel</SelectItem>
                          <SelectItem value="Manhwa">Manhwa</SelectItem>
                          <SelectItem value="Manhua">Manhua</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cover Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="coverImage" className="text-card-foreground">URL da Capa *</Label>
                  <Input
                    id="coverImage"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                    required
                    className="rounded-xl"
                  />
                </div>

                {/* Banner Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="bannerImage" className="text-card-foreground">URL do Banner (opcional)</Label>
                  <Input
                    id="bannerImage"
                    value={formData.bannerImage}
                    onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                    placeholder="https://exemplo.com/banner.jpg"
                    className="rounded-xl"
                  />
                </div>

                {/* Score */}
                <ScoreSlider
                  score={formData.score}
                  onChange={(score) => setFormData({ ...formData, score })}
                />
              </TabsContent>

              <TabsContent value="progress" className="space-y-5 mt-0">
                {/* Episode/Chapter Progress */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentProgress" className="text-card-foreground">
                      {isAnime ? 'Episódios Assistidos' : 'Capítulos Lidos'}
                    </Label>
                    <Input
                      id="currentProgress"
                      type="text"
                      inputMode="decimal"
                      value={isAnime ? formData.currentEpisode : formData.currentChapter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [isAnime ? 'currentEpisode' : 'currentChapter']: e.target.value,
                        })
                      }
                      placeholder="0"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalProgress" className="text-card-foreground">
                      Total de {isAnime ? 'Episódios' : 'Capítulos'}
                    </Label>
                    <Input
                      id="totalProgress"
                      type="text"
                      inputMode="decimal"
                      value={isAnime ? formData.totalEpisodes : formData.totalChapters}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [isAnime ? 'totalEpisodes' : 'totalChapters']: e.target.value,
                        })
                      }
                      placeholder="0"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Volume Progress (Manga only) */}
                {!isAnime && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentVolume" className="text-card-foreground">
                        Volumes Lidos
                      </Label>
                      <Input
                        id="currentVolume"
                        type="text"
                        inputMode="decimal"
                        value={formData.currentVolume}
                        onChange={(e) =>
                          setFormData({ ...formData, currentVolume: e.target.value })
                        }
                        placeholder="0"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalVolumes" className="text-card-foreground">
                        Total de Volumes
                      </Label>
                      <Input
                        id="totalVolumes"
                        type="text"
                        inputMode="decimal"
                        value={formData.totalVolumes}
                        onChange={(e) =>
                          setFormData({ ...formData, totalVolumes: e.target.value })
                        }
                        placeholder="0"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-card-foreground">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-card-foreground">Data de Conclusão</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Rewatch Count */}
                <div className="space-y-2">
                  <Label htmlFor="rewatchCount" className="text-card-foreground">
                    Vezes {isAnime ? 'Reassistido' : 'Relido'}
                  </Label>
                  <Input
                    id="rewatchCount"
                    type="number"
                    min="0"
                    value={formData.rewatchCount}
                    onChange={(e) =>
                      setFormData({ ...formData, rewatchCount: parseInt(e.target.value) || 0 })
                    }
                    className="rounded-xl"
                  />
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-5 mt-0">
                {/* Studio/Author */}
                <div className="grid grid-cols-2 gap-4">

                  {/* Streaming Platforms */}
                  {isAnime && (
                    <div className="col-span-2 space-y-2">
                      <Label className="text-card-foreground">Onde Assistir? (Para o Calendário)</Label>
                      <div className="flex flex-wrap gap-4 p-4 bg-secondary/30 rounded-xl">
                        {PLATFORMS.map((platform) => (
                          <div
                            key={platform}
                            onClick={() => toggleStreaming(platform)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border-2 w-24",
                              (formData.userStreaming || []).includes(platform)
                                ? "border-primary bg-primary/10"
                                : "border-transparent hover:bg-secondary/50"
                            )}
                          >
                            <StreamingPlatformIcon platform={platform} size={32} />
                            <span className="text-xs text-center font-medium leading-tight">{platform}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isAnime && (
                    <div className="space-y-2">
                      <Label htmlFor="studio" className="text-card-foreground">Estúdio</Label>
                      <Input
                        id="studio"
                        value={formData.studio}
                        onChange={(e) => setFormData({ ...formData, studio: e.target.value })}
                        placeholder="Ex: Kyoto Animation"
                        className="rounded-xl"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="author" className="text-card-foreground">
                      {isAnime ? 'Diretor/Autor Original' : 'Autor/Mangaká'}
                    </Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Ex: Makoto Shinkai"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Year and Season */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="releaseYear" className="text-card-foreground">Ano de Lançamento</Label>
                    <Input
                      id="releaseYear"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 2}
                      value={formData.releaseYear}
                      onChange={(e) =>
                        setFormData({ ...formData, releaseYear: parseInt(e.target.value) || 0 })
                      }
                      className="rounded-xl"
                    />
                  </div>

                  {isAnime && (
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Temporada</Label>
                      <Select
                        value={formData.season || 'none'}
                        onValueChange={(value) =>
                          setFormData({ ...formData, season: value === 'none' ? '' : value })
                        }
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {SEASONS.map((season) => (
                            <SelectItem key={season} value={season}>
                              {season}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Broadcast Day (Anime only) */}
                {isAnime && (
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Dia de Exibição (Semanal)</Label>
                    <Select
                      value={formData.broadcastDay || 'none'}
                      onValueChange={(value) =>
                        setFormData({ ...formData, broadcastDay: value === 'none' ? '' : value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Age Rating */}
                <div className="space-y-2">
                  <Label className="text-card-foreground">Classificação Etária</Label>
                  <Select
                    value={formData.ageRating}
                    onValueChange={(value: AgeRating) =>
                      setFormData({ ...formData, ageRating: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AGE_RATING_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {key} - {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Genres */}
                <div className="space-y-2">
                  <Label className="text-card-foreground">Gêneros</Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-secondary/30 rounded-xl max-h-40 overflow-y-auto">
                    {GENRES.map((genre) => (
                      <Badge
                        key={genre}
                        variant={formData.genres.includes(genre) ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-all',
                          formData.genres.includes(genre) && 'bg-primary text-primary-foreground'
                        )}
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-card-foreground">
                    Tags (separadas por vírgula)
                  </Label>
                  <Input
                    id="tags"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Ex: Emocional, Plot Twist, Romance lento"
                    className="rounded-xl"
                  />
                </div>

                {/* Synopsis */}
                <div className="space-y-2">
                  <Label htmlFor="synopsis" className="text-card-foreground">Sinopse</Label>
                  <Textarea
                    id="synopsis"
                    value={formData.synopsis}
                    onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                    placeholder="Breve descrição da história..."
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>

                {/* Review */}
                <div className="space-y-2">
                  <Label htmlFor="review" className="text-card-foreground">Minha Review</Label>
                  <Textarea
                    id="review"
                    value={formData.review}
                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                    placeholder="O que você achou?"
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-card-foreground">Notas Pessoais</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Anotações, lembretes..."
                    rows={2}
                    className="rounded-xl resize-none"
                  />
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-5 mt-0">
                {/* Trailer URL */}
                <div className="space-y-2">
                  <Label htmlFor="trailerUrl" className="text-card-foreground">URL do Trailer (YouTube)</Label>
                  <Input
                    id="trailerUrl"
                    value={formData.trailerUrl}
                    onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="rounded-xl"
                  />
                </div>

                {/* Large Cover Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="coverImageLarge" className="text-card-foreground">URL da Capa Grande (opcional)</Label>
                  <Input
                    id="coverImageLarge"
                    value={formData.coverImageLarge}
                    onChange={(e) => setFormData({ ...formData, coverImageLarge: e.target.value })}
                    placeholder="https://exemplo.com/imagem-hd.jpg"
                    className="rounded-xl"
                  />
                </div>

                {/* Opening URL */}
                {isAnime && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="openingUrl" className="text-card-foreground">URL da Opening</Label>
                      <Input
                        id="openingUrl"
                        value={formData.openingUrl}
                        onChange={(e) => setFormData({ ...formData, openingUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endingUrl" className="text-card-foreground">URL da Ending</Label>
                      <Input
                        id="endingUrl"
                        value={formData.endingUrl}
                        onChange={(e) => setFormData({ ...formData, endingUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                        className="rounded-xl"
                      />
                    </div>
                  </>
                )}
              </TabsContent>
            </div>
          </Tabs>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" className="flex-1">
              {mode === 'add' ? 'Adicionar' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
