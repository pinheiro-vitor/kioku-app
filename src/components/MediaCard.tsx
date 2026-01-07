import { useState, memo } from 'react';
import { Heart } from 'lucide-react';
import { MediaItem, TYPE_LABELS, STATUS_LABELS } from '@/types/media';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  className?: string;
  index?: number;
}

const scoreColors: Record<number, string> = {
  0: 'bg-muted text-muted-foreground',
  1: 'bg-red-600 text-white',
  2: 'bg-red-500 text-white',
  3: 'bg-orange-600 text-white',
  4: 'bg-orange-500 text-white',
  5: 'bg-yellow-500 text-white',
  6: 'bg-lime-500 text-white',
  7: 'bg-green-500 text-white',
  8: 'bg-emerald-500 text-white',
  9: 'bg-teal-500 text-white',
  10: 'bg-primary text-primary-foreground',
};

export const MediaCard = memo(function MediaCard({ item, onClick, onToggleFavorite, className, index = 0 }: MediaCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const isAnime = item.type === 'anime';
  const current = isAnime ? item.currentEpisode : item.currentChapter;
  const total = isAnime ? item.totalEpisodes : item.totalChapters;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className={cn(
        'card-kioku cursor-pointer group relative flex flex-col w-full max-w-[200px] h-full',
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-2xl bg-muted/30">
        {!isImageLoaded && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <img
          src={item.coverImage}
          alt={item.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            isImageLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Hover Glow Effect - Simplified to avoid "dirty" look */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite Button - Top Left */}
        {onToggleFavorite && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            className={cn(
              'absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all',
              'bg-black/40 backdrop-blur-md hover:bg-black/60 text-white',
              item.isFavorite && 'text-accent'
            )}
          >
            <Heart
              className={cn('h-4 w-4', item.isFavorite && 'fill-current')}
            />
          </motion.button>
        )}

        {/* Score Badge - Top Right */}
        <div className={cn(
          'absolute top-2 right-2 rounded-lg px-2 py-1 font-display text-sm shadow-lg backdrop-blur-sm',
          scoreColors[Math.floor(item.score)]
        )}>
          {item.score > 0 ? item.score.toFixed(1) : '—'}
        </div>

        {/* Type Badge - Bottom Left */}
        <Badge
          variant="secondary"
          className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-xs backdrop-blur-sm shadow-lg border-none"
        >
          {TYPE_LABELS[item.type]}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between bg-card">
        <h3 className="font-display text-lg leading-tight line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] h-5 border-border',
              item.status === 'completed' && 'border-green-500/50 text-green-600 bg-green-500/10',
              (item.status === 'watching' || item.status === 'reading') && 'border-amber-500/50 text-amber-600 bg-amber-500/10',
              item.status === 'dropped' && 'border-red-500/50 text-red-600 bg-red-500/10'
            )}
          >
            {STATUS_LABELS[item.status]}
          </Badge>

          <span className="text-xs text-muted-foreground font-medium">
            {current}/{total || '?'}
          </span>
        </div>
      </div>
    </motion.article>
  );
});
