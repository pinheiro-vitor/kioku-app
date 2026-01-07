import { ManualCalendarEntry } from '@/hooks/useManualCalendar';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import { StreamingPlatformIcon } from './StreamingPlatformIcon';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface ManualCalendarCardProps {
    entry: ManualCalendarEntry;
    onEdit: () => void;
    onDelete: () => void;
}

export function ManualCalendarCard({ entry, onEdit, onDelete }: ManualCalendarCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: entry.id,
        data: { entry }
    });

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 999 : undefined,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative flex flex-col gap-3 ${isDragging ? 'opacity-50' : ''}`}
        >
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-md bg-secondary/30">
                {entry.image ? (
                    <img
                        src={entry.image}
                        alt={entry.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                        <span className="text-3xl font-display opacity-20">{entry.title.charAt(0)}</span>
                    </div>
                )}

                {/* Drag Handle (Visible on hover) */}
                <div
                    {...listeners}
                    {...attributes}
                    className="absolute top-2 left-2 p-1.5 bg-black/60 text-white/50 hover:text-white rounded-md cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm"
                >
                    <GripVertical className="w-4 h-4" />
                </div>

                {/* Overlay actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 rounded-full shadow-sm"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                {/* Time Badge */}
                {entry.time && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-white border border-white/10 text-xs font-bold">
                        {entry.time}
                    </div>
                )}
            </div>

            <div className="space-y-1.5">
                <h3 className="font-semibold text-base leading-tight line-clamp-2">
                    {entry.title}
                </h3>

                {entry.streaming.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {entry.streaming.map(platform => (
                            <div key={platform} className="text-xs text-muted-foreground flex items-center justify-center bg-secondary/80 p-1.5 rounded-md hover:bg-secondary transition-colors" title={platform}>
                                <StreamingPlatformIcon platform={platform.toLowerCase()} size={18} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
