export type MediaType = 'anime' | 'manga' | 'manhwa';

export type MediaStatus = 'watching' | 'reading' | 'completed' | 'on-hold' | 'dropped' | 'plan-to-watch';

export type AgeRating = 'G' | 'PG' | 'PG-13' | 'R' | 'R+' | 'Rx';

export interface RelatedMedia {
  id: string;
  title: string;
  relation: 'sequel' | 'prequel' | 'spin-off' | 'alternative' | 'side-story';
}

export interface MediaItem {
  id: string;
  malId?: number; // Jikan ID for fetching recommendations
  title: string;
  titleOriginal?: string;
  sourceUrl?: string;
  type: MediaType;
  format?: string; // TV, Movie, OVA, One-shot, etc.
  coverImage: string;
  coverImageLarge?: string;
  bannerImage?: string;
  status: MediaStatus;
  score: number; // 0-10
  currentEpisode: number;
  totalEpisodes: number;
  currentChapter: number;
  totalChapters: number;
  currentVolume: number;
  totalVolumes: number;
  synopsis: string;
  review: string;
  genres: string[];
  tags: string[];
  studio?: string;
  author?: string;
  releaseYear?: number;
  season?: string;
  ageRating?: AgeRating;
  trailerUrl?: string;
  openingUrl?: string;
  endingUrl?: string;
  broadcastDay?: string;
  relatedMedia?: RelatedMedia[];
  startDate?: string;
  endDate?: string;
  rewatchCount: number;
  isFavorite: boolean;
  customLists: string[];
  notes: string;
  streamingServices?: { name: string; url: string; color: string; short: string }[];
  userStreaming?: string[]; // Array of platform keys (e.g. 'netflix', 'crunchyroll')
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  mediaId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface CustomList {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  itemIds?: string[]; // IDs of media items in this list
  isPublic: boolean;
  coverImage?: string;
  createdAt: string;
}

export const STATUS_LABELS: Record<MediaStatus, string> = {
  'watching': 'Assistindo',
  'reading': 'Lendo',
  'completed': 'Completo',
  'on-hold': 'Em Pausa',
  'dropped': 'Abandonado',
  'plan-to-watch': 'Planejado',
};

export const TYPE_LABELS: Record<MediaType, string> = {
  'anime': 'Anime',
  'manga': 'Mangá',
  'manhwa': 'Manhwa',
};

export const AGE_RATING_LABELS: Record<AgeRating, string> = {
  'G': 'Livre',
  'PG': '10+',
  'PG-13': '13+',
  'R': '17+',
  'R+': '18+',
  'Rx': 'Adulto',
};

export const GENRES = [
  'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Horror', 'Isekai',
  'Mistério', 'Suspense', 'Romance', 'Sci-Fi', 'Slice of Life', 'Vida Escolar', 'Esportes',
  'Sobrenatural', 'Psicológico', 'Mecha', 'Musical', 'Gore', 'Ecchi',
  'Harem', 'Yaoi', 'Yuri', 'Hentai', 'Shounen', 'Shoujo', 'Seinen', 'Josei'
];

export const SEASONS = ['Inverno', 'Primavera', 'Verão', 'Outono'];

export const DAYS_OF_WEEK = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

export type CreateMediaItemDTO = Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt' | 'customLists'>;
export type UpdateMediaItemDTO = Partial<CreateMediaItemDTO>;

