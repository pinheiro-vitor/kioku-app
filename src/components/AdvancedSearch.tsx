import { useState } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import { MediaType, MediaStatus, TYPE_LABELS, STATUS_LABELS, GENRES } from '@/types/media';
import { cn } from '@/lib/utils';

interface SearchFilters {
  query: string;
  type: MediaType | 'all';
  status: MediaStatus | 'all' | 'stagnant';
  genres: string[];
  minScore: number;
  maxScore: number;
  year?: number;
  sortBy: 'title' | 'score' | 'updatedAt' | 'releaseYear';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableYears: number[];
  className?: string;
}

export function AdvancedSearch({
  filters,
  onFiltersChange,
  availableYears,
  className,
}: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleGenre = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter((g) => g !== genre)
      : [...filters.genres, genre];
    updateFilter('genres', newGenres);
  };

  const clearFilters = () => {
    onFiltersChange({
      query: '',
      type: 'all',
      status: 'all',
      genres: [],
      minScore: 0,
      maxScore: 10,
      year: undefined,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
  };

  const activeFiltersCount = [
    filters.type !== 'all',
    filters.status !== 'all',
    filters.genres.length > 0,
    filters.minScore > 0,
    filters.maxScore < 10,
    filters.year !== undefined,
  ].filter(Boolean).length;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, gênero, estúdio, autor..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10 rounded-xl"
          />
          {filters.query && (
            <button
              onClick={() => updateFilter('query', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="kioku" className="gap-2 relative">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-display text-2xl">Filtros Avançados</SheetTitle>
              <SheetDescription>
                Refine sua busca por tipo, status, gênero, nota e ano.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tipo</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => updateFilter('type', value as MediaType | 'all')}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilter('status', value as MediaStatus | 'all')}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="stagnant">Estagnados (+30 dias)</SelectItem>
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ano de Lançamento</label>
                <Select
                  value={filters.year?.toString() || 'all'}
                  onValueChange={(value) =>
                    updateFilter('year', value === 'all' ? undefined : parseInt(value))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Todos os anos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os anos</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Score Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Nota: {filters.minScore} - {filters.maxScore}
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={filters.minScore}
                    onChange={(e) => updateFilter('minScore', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-muted-foreground">até</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={filters.maxScore}
                    onChange={(e) => updateFilter('maxScore', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                </div>
              </div>

              {/* Genre Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Gêneros</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <Badge
                      key={genre}
                      variant={filters.genres.includes(genre) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-all',
                        filters.genres.includes(genre) && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ordenar por</label>
                <div className="flex gap-2">
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) =>
                      updateFilter('sortBy', value as SearchFilters['sortBy'])
                    }
                  >
                    <SelectTrigger className="rounded-xl flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updatedAt">Atualização</SelectItem>
                      <SelectItem value="title">Título</SelectItem>
                      <SelectItem value="score">Nota</SelectItem>
                      <SelectItem value="releaseYear">Ano</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value) =>
                      updateFilter('sortOrder', value as 'asc' | 'desc')
                    }
                  >
                    <SelectTrigger className="rounded-xl w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Decrescente</SelectItem>
                      <SelectItem value="asc">Crescente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  Limpar Filtros
                </Button>
                <Button variant="gradient" onClick={() => setIsOpen(false)} className="flex-1">
                  Aplicar
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.type !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {TYPE_LABELS[filters.type]}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('type', 'all')}
              />
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.status === 'stagnant' ? 'Estagnados' : STATUS_LABELS[filters.status]}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('status', 'all')}
              />
            </Badge>
          )}
          {filters.genres.map((genre) => (
            <Badge key={genre} variant="secondary" className="gap-1">
              {genre}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleGenre(genre)}
              />
            </Badge>
          ))}
          {filters.year && (
            <Badge variant="secondary" className="gap-1">
              {filters.year}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('year', undefined)}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground text-xs"
          >
            Limpar todos
          </Button>
        </div>
      )}
    </div>
  );
}
