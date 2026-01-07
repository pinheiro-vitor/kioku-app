import { useState, useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import { Plus } from 'lucide-react';

import { AdvancedSearch } from '@/components/AdvancedSearch';
import { CustomListsManager } from '@/components/CustomListsManager';
import { Button } from '@/components/ui/button';
import { MediaCard } from '@/components/MediaCard';
import { MediaCardSkeleton } from '@/components/MediaCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaDetailModal } from '@/components/MediaDetailModal';
import { MediaFormModal } from '@/components/MediaFormModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { EmptyState } from '@/components/EmptyState';
import { StatisticsPanel } from '@/components/StatisticsPanel';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { useTheme } from '@/hooks/useTheme';
import { MediaItem, MediaType, MediaStatus } from '@/types/media';
import { useToast } from '@/hooks/use-toast';

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

const defaultFilters: SearchFilters = {
  query: '',
  type: 'all',
  status: 'all',
  genres: [],
  minScore: 0,
  maxScore: 10,
  year: undefined,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

const LibraryPage = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    items,
    customLists,
    isLoaded,
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    addCustomList,
    updateCustomList,
    deleteCustomList,
    addItemToList,
    removeItemFromList,
    getRecommendations,
    getStatistics,
  } = useMediaLibrary();
  const { toast } = useToast();

  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [activeList, setActiveList] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<MediaItem | undefined>(undefined);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = items;

    // Filter by custom list
    if (activeList) {
      const list = customLists.find((l) => l.id === activeList);
      if (list) {
        result = result.filter((item) => list.itemIds.includes(item.id));
      }
    }

    // Search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.titleOriginal?.toLowerCase().includes(query) ||
          item.genres.some((g) => g.toLowerCase().includes(query)) ||
          item.tags.some((t) => t.toLowerCase().includes(query)) ||
          item.studio?.toLowerCase().includes(query) ||
          item.author?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      result = result.filter((item) => item.type === filters.type);
    }

    // Status filter
    if (filters.status === 'stagnant') {
      const now = new Date();
      result = result.filter((item) => {
        const isActive = item.status === 'watching' || item.status === 'reading';
        const daysInactive = differenceInDays(now, new Date(item.updatedAt));
        return isActive && daysInactive > 30;
      });
    } else if (filters.status !== 'all') {
      result = result.filter((item) => item.status === filters.status);
    }

    // Genre filter
    if (filters.genres.length > 0) {
      result = result.filter((item) =>
        filters.genres.some((g) => item.genres.includes(g))
      );
    }

    // Score filter
    result = result.filter(
      (item) => item.score >= filters.minScore && item.score <= filters.maxScore
    );

    // Year filter
    if (filters.year) {
      result = result.filter((item) => item.releaseYear === filters.year);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'releaseYear':
          comparison = (a.releaseYear || 0) - (b.releaseYear || 0);
          break;
        case 'updatedAt':
        default:
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [items, filters, activeList, customLists]);

  // Get available years for filter
  const availableYears = useMemo(() => {
    const years = new Set(items.map((i) => i.releaseYear).filter(Boolean) as number[]);
    return Array.from(years).sort((a, b) => b - a);
  }, [items]);

  // Statistics
  const statistics = useMemo(() => getStatistics(), [items]);

  const handleCardClick = (item: MediaItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleAddNew = () => {
    setFormMode('add');
    setEditingItem(undefined);
    setIsFormModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedItem) {
      setFormMode('edit');
      setEditingItem(selectedItem);
      setIsDetailModalOpen(false);
      setIsFormModalOpen(true);
    }
  };

  const handleDelete = () => {
    setIsDetailModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      deleteItem(selectedItem.id);
      toast({
        title: 'Item excluído',
        description: `"${selectedItem.title}" foi removido da sua biblioteca.`,
      });
      setSelectedItem(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleUpdateStatus = (status: MediaStatus) => {
    if (selectedItem) {
      updateItem(selectedItem.id, { status });
      setSelectedItem({ ...selectedItem, status });
      toast({
        title: 'Status atualizado',
        description: `"${selectedItem.title}" foi atualizado.`,
      });
    }
  };

  const handleUpdateProgress = (current: number) => {
    if (selectedItem) {
      const isAnime = selectedItem.type === 'anime';
      const updates = isAnime
        ? { currentEpisode: current }
        : { currentChapter: current };
      updateItem(selectedItem.id, updates);
      setSelectedItem({
        ...selectedItem,
        ...(isAnime ? { currentEpisode: current } : { currentChapter: current }),
      });
    }
  };

  const handleUpdateScore = (score: number) => {
    if (selectedItem) {
      updateItem(selectedItem.id, { score });
      setSelectedItem({ ...selectedItem, score });
    }
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, isFavorite: !selectedItem.isFavorite });
    }
  };

  const handleFormSubmit = (data: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (formMode === 'add') {
      addItem(data);
      toast({
        title: 'Item adicionado',
        description: `"${data.title}" foi adicionado à sua biblioteca.`,
      });
    } else if (editingItem) {
      updateItem(editingItem.id, data);
      toast({
        title: 'Item atualizado',
        description: `"${data.title}" foi atualizado.`,
      });
    }
  };

  const handleSelectRecommendation = (item: MediaItem) => {
    setSelectedItem(item);
  };

  const handleAddToList = (listId: string) => {
    if (selectedItem) {
      addItemToList(selectedItem.id, listId);
      setSelectedItem({
        ...selectedItem,
        customLists: [...selectedItem.customLists, listId],
      });
    }
  };

  const handleRemoveFromList = (listId: string) => {
    if (selectedItem) {
      removeItemFromList(selectedItem.id, listId);
      setSelectedItem({
        ...selectedItem,
        customLists: selectedItem.customLists.filter((id) => id !== listId),
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen">

        <main className="container mx-auto px-4 py-6">
          {/* Skeleton Header */}
          <div className="mb-6 space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-32 bg-muted/50" />
          </div>

          {/* Skeleton Filters */}
          <div className="mb-6">
            <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mt-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">


      <main className="container mx-auto px-4 py-6">
        {showStats ? (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-2">
                Minhas Estatísticas
              </h2>
              <p className="text-muted-foreground">
                Visão geral do seu consumo de mídia
              </p>
            </div>
            <StatisticsPanel stats={statistics} />
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-2">
                  Minha Biblioteca
                </h2>
                <p className="text-muted-foreground">
                  {items.length} {items.length === 1 ? 'item' : 'itens'} na sua coleção
                </p>
              </div>
            </div>

            {/* Custom Lists */}
            <div className="mb-6">
              <CustomListsManager
                lists={customLists}
                activeList={activeList}
                onSelectList={setActiveList}
                onAddList={addCustomList}
                onUpdateList={updateCustomList}
                onDeleteList={deleteCustomList}
                onAddMedia={handleAddNew}
              />
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
              <AdvancedSearch
                filters={filters}
                onFiltersChange={setFilters}
                availableYears={availableYears}
              />
            </div>

            {/* Results Count */}
            {(filters.query || filters.type !== 'all' || filters.status !== 'all' || filters.genres.length > 0) && (
              <p className="text-sm text-muted-foreground mb-4">
                {filteredItems.length} {filteredItems.length === 1 ? 'resultado' : 'resultados'} encontrado{filteredItems.length !== 1 ? 's' : ''}
              </p>
            )}

            {/* Media Grid */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="animate-slide-up opacity-0"
                  >
                    <MediaCard
                      item={item}
                      onClick={() => handleCardClick(item)}
                      onToggleFavorite={() => handleToggleFavorite(item.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState onAddNew={handleAddNew} />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {selectedItem && (
        <MediaDetailModal
          item={selectedItem}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdateStatus={handleUpdateStatus}
          onUpdateProgress={handleUpdateProgress}
          onToggleFavorite={() => handleToggleFavorite(selectedItem.id)}
          onUpdateScore={handleUpdateScore}
          recommendations={getRecommendations(selectedItem.id)}
          onSelectRecommendation={handleSelectRecommendation}
          customLists={customLists}
          onAddToList={handleAddToList}
          onRemoveFromList={handleRemoveFromList}
        />
      )}

      <MediaFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        mode={formMode}
      />

      {selectedItem && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          itemTitle={selectedItem.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};

export default LibraryPage;
