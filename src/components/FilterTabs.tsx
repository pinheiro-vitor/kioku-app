import { cn } from '@/lib/utils';
import { MediaType, TYPE_LABELS } from '@/types/media';

interface FilterTabsProps {
  activeFilter: MediaType | 'all';
  onFilterChange: (filter: MediaType | 'all') => void;
  counts: {
    all: number;
    anime: number;
    manga: number;
    manhwa: number;
  };
}

export function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
  const tabs: { value: MediaType | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'anime', label: TYPE_LABELS.anime },
    { value: 'manga', label: TYPE_LABELS.manga },
    { value: 'manhwa', label: TYPE_LABELS.manhwa },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onFilterChange(tab.value)}
          className={cn(
            'px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300',
            activeFilter === tab.value
              ? 'btn-primary-gradient text-primary-foreground shadow-lg'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {tab.label}
          <span
            className={cn(
              'ml-2 px-2 py-0.5 rounded-full text-xs',
              activeFilter === tab.value
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {counts[tab.value]}
          </span>
        </button>
      ))}
    </div>
  );
}
