import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => handleClick(i)}
          disabled={!interactive}
          className={cn(
            'transition-transform duration-200',
            interactive && 'hover:scale-125 cursor-pointer',
            !interactive && 'cursor-default'
          )}
        >
          <Star
            size={size}
            className={cn(
              'transition-colors duration-200',
              i < rating ? 'star-filled fill-current' : 'star-empty'
            )}
          />
        </button>
      ))}
    </div>
  );
}
