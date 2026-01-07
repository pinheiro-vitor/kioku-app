import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MediaItem, MediaType, MediaStatus, CustomList, CreateMediaItemDTO, UpdateMediaItemDTO } from '@/types/media';
import { useAuth } from '@/contexts/AuthContext'; // Legacy context, might need cleanup later
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export function useMediaLibrary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper to map backend snake_case to frontend camelCase
  const mapBackendToFrontend = useCallback((data: any): MediaItem => ({
    id: data.id,
    malId: data.mal_id,
    title: data.title,
    titleOriginal: data.title_original,
    sourceUrl: data.source_url,
    type: data.type,
    coverImage: data.cover_image,
    bannerImage: data.banner_image,
    status: data.status,
    score: Number(data.score),
    currentEpisode: data.current_episode,
    totalEpisodes: data.total_episodes,
    currentChapter: data.current_chapter,
    totalChapters: data.total_chapters,
    currentVolume: data.current_volume,
    totalVolumes: data.total_volumes,
    synopsis: data.synopsis,
    review: data.review,
    genres: data.genres || [],
    tags: data.tags || [],
    studio: data.studio,
    author: data.author,
    releaseYear: data.release_year,
    season: data.season,
    ageRating: data.age_rating,
    trailerUrl: data.trailer_url,
    openingUrl: data.opening_url,
    endingUrl: data.ending_url,
    broadcastDay: data.broadcast_day,
    startDate: data.start_date,
    endDate: data.end_date,
    rewatchCount: data.rewatch_count,
    isFavorite: Boolean(data.is_favorite),
    notes: data.notes,
    customLists: [], // TODO: Custom Lists implementation in Supabase
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }), []);

  // Fetch Media Items from Supabase
  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['media-items'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        throw error;
      }
      return data.map(mapBackendToFrontend);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch Custom Lists
  const { data: customLists = [], isLoading: isLoadingLists } = useQuery({
    queryKey: ['custom-lists'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('custom_lists')
        .select(`
          *,
          media_list_items (media_id)
        `)
        .order('name');

      if (error) {
        console.error('Error fetching lists:', error);
        throw error;
      }

      return data.map((list: any) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        icon: list.icon,
        color: list.color,
        itemIds: list.media_list_items?.map((i: any) => i.media_id) || [],
        createdAt: list.created_at,
      }));
    }
  });

  const isLoaded = !isLoadingItems && !isLoadingLists;

  // Mutations
  const addItemMutation = useMutation({
    mutationFn: async (item: CreateMediaItemDTO) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const payload = {
        user_id: session.user.id,
        mal_id: item.malId,
        title: item.title,
        title_original: item.titleOriginal,
        source_url: item.sourceUrl,
        type: item.type,
        cover_image: item.coverImage,
        banner_image: item.bannerImage,
        status: item.status,
        score: item.score,
        current_episode: item.currentEpisode,
        total_episodes: item.totalEpisodes,
        current_chapter: item.currentChapter,
        total_chapters: item.totalChapters,
        current_volume: item.currentVolume,
        total_volumes: item.totalVolumes,
        synopsis: item.synopsis,
        review: item.review,
        genres: item.genres,
        tags: item.tags,
        studio: item.studio,
        author: item.author,
        release_year: item.releaseYear,
        season: item.season,
        age_rating: item.ageRating,
        trailer_url: item.trailerUrl,
        start_date: item.startDate || null,
        end_date: item.endDate || null,
        rewatch_count: item.rewatchCount,
        is_favorite: item.isFavorite,
        notes: item.notes,
        broadcast_day: item.broadcastDay
      };

      const { data, error } = await supabase.from('media_items').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-items'] });
      toast({ title: 'Item adicionado com sucesso!' });
    },
    onError: (error) => {
      console.error('Failed to add item', error);
      toast({ title: 'Erro ao adicionar item', variant: 'destructive' });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateMediaItemDTO }) => {
      const payload: any = {};
      // Mapping updates to snake_case
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.titleOriginal !== undefined) payload.title_original = updates.titleOriginal;
      if (updates.sourceUrl !== undefined) payload.source_url = updates.sourceUrl;
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.score !== undefined) payload.score = updates.score;
      if (updates.currentEpisode !== undefined) payload.current_episode = updates.currentEpisode;
      if (updates.totalEpisodes !== undefined) payload.total_episodes = updates.totalEpisodes;
      if (updates.currentChapter !== undefined) payload.current_chapter = updates.currentChapter;
      if (updates.totalChapters !== undefined) payload.total_chapters = updates.totalChapters;
      if (updates.currentVolume !== undefined) payload.current_volume = updates.currentVolume;
      if (updates.totalVolumes !== undefined) payload.total_volumes = updates.totalVolumes;
      if (updates.synopsis !== undefined) payload.synopsis = updates.synopsis;
      if (updates.review !== undefined) payload.review = updates.review;
      if (updates.genres !== undefined) payload.genres = updates.genres;
      if (updates.tags !== undefined) payload.tags = updates.tags;
      if (updates.studio !== undefined) payload.studio = updates.studio;
      if (updates.author !== undefined) payload.author = updates.author;
      if (updates.releaseYear !== undefined) payload.release_year = updates.releaseYear;
      if (updates.season !== undefined) payload.season = updates.season;
      if (updates.ageRating !== undefined) payload.age_rating = updates.ageRating;
      if (updates.trailerUrl !== undefined) payload.trailer_url = updates.trailerUrl;
      if (updates.startDate !== undefined) payload.start_date = updates.startDate || null;
      if (updates.endDate !== undefined) payload.end_date = updates.endDate || null;
      if (updates.rewatchCount !== undefined) payload.rewatch_count = updates.rewatchCount;
      if (updates.isFavorite !== undefined) payload.is_favorite = updates.isFavorite;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.bannerImage !== undefined) payload.banner_image = updates.bannerImage;
      if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;
      if (updates.broadcastDay !== undefined) payload.broadcast_day = updates.broadcastDay;

      const { error } = await supabase.from('media_items').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-items'] });
    },
    onError: (error) => {
      console.error('Failed to update item', error);
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('media_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-items'] });
      toast({ title: 'Item removido.' });
    },
    onError: (error) => {
      console.error('Failed to delete item', error);
      toast({ title: 'Erro ao remover item', variant: 'destructive' });
    }
  });

  // Custom List Mutations
  const addCustomListMutation = useMutation({
    mutationFn: async (list: { name: string; description?: string; icon?: string; color?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase.from('custom_lists').insert({
        user_id: session.user.id,
        name: list.name,
        description: list.description,
        icon: list.icon || 'Heart',
        color: list.color || '#ef4444'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-lists'] });
      toast({ title: 'Lista criada com sucesso!' });
    }
  });

  const updateCustomListMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase.from('custom_lists').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-lists'] });
      toast({ title: 'Lista atualizada!' });
    }
  });

  const deleteCustomListMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_lists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-lists'] });
      toast({ title: 'Lista removida.' });
    }
  });

  const addItemToListMutation = useMutation({
    mutationFn: async ({ listId, mediaId }: { listId: string; mediaId: string }) => {
      const { error } = await supabase.from('media_list_items').insert({
        list_id: listId,
        media_id: mediaId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-lists'] });
      toast({ title: 'Adicionado à lista!' });
    }
  });

  const removeItemFromListMutation = useMutation({
    mutationFn: async ({ listId, mediaId }: { listId: string; mediaId: string }) => {
      const { error } = await supabase.from('media_list_items')
        .delete()
        .eq('list_id', listId)
        .eq('media_id', mediaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-lists'] });
      toast({ title: 'Removido da lista.' });
    }
  });

  // Wrappers to match previous API
  // Wrappers to match previous API
  const addItem = (item: CreateMediaItemDTO) => addItemMutation.mutateAsync(item);
  const updateItem = (id: string, updates: UpdateMediaItemDTO) => updateItemMutation.mutateAsync({ id, updates });
  const deleteItem = (id: string) => deleteItemMutation.mutateAsync(id);
  const toggleFavorite = async (id: string) => {
    const item = items.find((i: MediaItem) => i.id === id);
    if (!item) return;
    await updateItem(id, { isFavorite: !item.isFavorite });
  };

  const addCustomList = (list: any) => addCustomListMutation.mutateAsync(list);
  const updateCustomList = (id: string, updates: any) => updateCustomListMutation.mutateAsync({ id, updates });
  const deleteCustomList = (id: string) => deleteCustomListMutation.mutateAsync(id);
  const addItemToList = (itemId: string, listId: string) => addItemToListMutation.mutateAsync({ listId, mediaId: itemId });
  const removeItemFromList = (itemId: string, listId: string) => removeItemFromListMutation.mutateAsync({ listId, mediaId: itemId });

  // Read-only helpers
  const getItemsByType = (type: MediaType | 'all') => {
    if (type === 'all') return items;
    return items.filter((item: MediaItem) => item.type === type);
  };

  const getItemsByStatus = (status: MediaStatus) => {
    return items.filter((item: MediaItem) => item.status === status);
  };

  const getItemsByList = (listId: string) => {
    return items.filter((item: MediaItem) => {
      if (!item.customLists) return false;
      return item.customLists.some(l =>
        (typeof l === 'string' && l === listId) ||
        (typeof l === 'object' && (l as any).id == listId)
      );
    });
  };

  const getFavorites = () => items.filter((item: MediaItem) => item.isFavorite);

  const searchItems = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item: MediaItem) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.titleOriginal?.toLowerCase().includes(lowerQuery) ||
        item.genres?.some((g) => g.toLowerCase().includes(lowerQuery)) ||
        item.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  };

  const getRecommendations = (itemId: string) => {
    const item = items.find((i: MediaItem) => i.id === itemId);
    if (!item) return [];
    return items.filter((i: MediaItem) => i.id !== itemId).slice(0, 11);
  };

  const filterItems = (filters: any) => {
    return items.filter((item: MediaItem) => {
      if (filters.type && filters.type !== 'all' && item.type !== filters.type) return false;
      if (filters.status && filters.status !== 'all' && item.status !== filters.status) return false;
      return true;
    });
  };

  // Statistics Calculation (same logic)
  const getStatistics = useCallback(() => {
    const totalItems = items.length;
    const totalAnime = items.filter((i: MediaItem) => i.type === 'anime').length;
    const totalManga = items.filter((i: MediaItem) => i.type === 'manga').length;
    const totalManhwa = items.filter((i: MediaItem) => i.type === 'manhwa').length;
    const totalEpisodes = items.reduce((acc: number, i: MediaItem) => acc + (i.currentEpisode || 0), 0);
    const totalChapters = items.reduce((acc: number, i: MediaItem) => acc + (i.currentChapter || 0), 0);
    const totalVolumes = items.reduce((acc: number, i: MediaItem) => acc + (i.currentVolume || 0), 0);
    const totalMinutes = totalEpisodes * 24;
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const completedItems = items.filter((i: MediaItem) => i.status === 'completed').length;
    const watchingItems = items.filter((i: MediaItem) => i.status === 'watching' || i.status === 'reading').length;
    const droppedItems = items.filter((i: MediaItem) => i.status === 'dropped').length;
    const averageScore = items.length > 0 ? items.filter((i: MediaItem) => i.score > 0).reduce((acc: number, i: MediaItem) => acc + i.score, 0) / items.filter((i: MediaItem) => i.score > 0).length : 0;

    const genreCounts: Record<string, number> = {};
    items.forEach((item: MediaItem) => {
      if (item.genres) {
        item.genres.forEach((genre) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const scoreDistribution = Array.from({ length: 11 }, (_, i) => ({
      score: i,
      count: items.filter((item: MediaItem) => Math.floor(item.score || 0) === i).length,
    }));

    const statusDistribution = [
      { status: 'Assistindo/Lendo', count: watchingItems },
      { status: 'Completo', count: completedItems },
      { status: 'Em Pausa', count: items.filter((i: MediaItem) => i.status === 'on-hold').length },
      { status: 'Abandonado', count: droppedItems },
      { status: 'Planejado', count: items.filter((i: MediaItem) => i.status === 'plan-to-watch').length },
    ];

    const activityHistory: any[] = [];

    return {
      totalItems, totalAnime, totalManga, totalManhwa, totalEpisodes, totalChapters, totalVolumes,
      totalMinutes, totalHours, totalDays, completedItems, watchingItems, droppedItems, averageScore,
      topGenres, scoreDistribution, statusDistribution, activityHistory
    };
  }, [items]);

  return {
    items,
    customLists,
    isLoaded,
    addItem,
    updateItem,
    deleteItem,
    getItemsByType,
    getItemsByStatus,
    getItemsByList,
    getFavorites,
    toggleFavorite,
    addCustomList,
    updateCustomList,
    deleteCustomList,
    addItemToList,
    removeItemFromList,
    searchItems,
    filterItems,
    getRecommendations,
    getStatistics,
  };
}
