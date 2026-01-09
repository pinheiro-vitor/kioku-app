import { cn } from '@/lib/utils';

interface ScoreInputProps {
  score: number;
  onChange?: (score: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const scoreLabels: Record<number, string> = {
  0: 'Sem nota',
  1: 'Horrível',
  2: 'Muito Ruim',
  3: 'Ruim',
  4: 'Fraco',
  5: 'Mediano',
  6: 'Bom',
  7: 'Muito Bom',
  8: 'Ótimo',
  9: 'Excelente',
  10: 'Obra-Prima',
};

const scoreColors: Record<number, string> = {
  0: 'bg-muted',
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-amber-500',
  4: 'bg-yellow-500',
  5: 'bg-lime-500',
  6: 'bg-green-500',
  7: 'bg-emerald-500',
  8: 'bg-teal-500',
  9: 'bg-cyan-500',
  10: 'bg-blue-500',
};

const accentColors: Record<number, string> = {
  0: 'accent-muted',
  1: 'accent-red-500',
  2: 'accent-orange-500',
  3: 'accent-amber-500',
  4: 'accent-yellow-500',
  5: 'accent-lime-500',
  6: 'accent-green-500',
  7: 'accent-emerald-500',
  8: 'accent-teal-500',
  9: 'accent-cyan-500',
  10: 'accent-blue-500',
};

export function ScoreInput({
  score,
  onChange,
  interactive = false,
  size = 'md',
  showLabel = true,
  className,
}: ScoreInputProps) {
  const sizeClasses = {
    sm: 'h-6 text-xs gap-0.5',
    md: 'h-8 text-sm gap-1',
    lg: 'h-10 text-base gap-1.5',
  };

  const dotSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleClick = (newScore: number) => {
    if (interactive && onChange) {
      onChange(newScore === score ? 0 : newScore);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className={cn('flex items-center', sizeClasses[size])}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleClick(num)}
            disabled={!interactive}
            className={cn(
              'rounded-full transition-all duration-200 flex items-center justify-center font-bold',
              dotSizes[size],
              num <= score ? scoreColors[score] : 'bg-muted',
              num <= score ? 'text-primary-foreground' : 'text-muted-foreground',
              interactive && 'hover:scale-110 cursor-pointer hover:ring-2 hover:ring-ring',
              !interactive && 'cursor-default'
            )}
          >
            {size !== 'sm' && num}
          </button>
        ))}
        <span className={cn(
          'ml-3 font-display text-foreground',
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-xl',
          size === 'lg' && 'text-2xl',
        )}>
          {score}/10
        </span>
      </div>

      {showLabel && (
        <span className={cn(
          'text-muted-foreground',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
        )}>
          {scoreLabels[Math.floor(score)]}
        </span>
      )}
    </div>
  );
}

export function ScoreSlider({
  score,
  onChange,
  className,
}: {
  score: number;
  onChange: (score: number) => void;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Nota</span>
        <span className={cn(
          'font-display text-xl px-3 py-1 rounded-lg',
          scoreColors[Math.floor(score)],
          score > 0 ? 'text-primary-foreground' : 'text-muted-foreground'
        )}>
          {score}/10
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="10"
        step="0.1"
        value={score}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={cn(
          "w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer transition-all duration-300",
          accentColors[Math.max(1, Math.floor(score))]
        )}
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span className="text-center">{scoreLabels[Math.floor(score)]}</span>
        <span>10</span>
      </div>
    </div>
  );
}
