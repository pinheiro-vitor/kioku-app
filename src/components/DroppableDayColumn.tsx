import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DroppableDayColumnProps {
    dayId: string;
    dayLabel: string;
    isToday: boolean;
    children: React.ReactNode;
}

export function DroppableDayColumn({ dayId, dayLabel, isToday, children }: DroppableDayColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: dayId,
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col gap-4 rounded-xl p-4 transition-colors min-h-[200px]",
                isToday ? "bg-purple-500/5 border border-purple-500/20" : "bg-card/50 border border-transparent",
                isOver ? "bg-purple-500/10 ring-2 ring-purple-500/30" : ""
            )}
        >
            <div className="flex items-center justify-between pointer-events-none">
                <h3 className={cn("text-xs font-bold uppercase tracking-widest", isToday ? "text-purple-400" : "text-muted-foreground")}>
                    {dayLabel}
                </h3>
                {isToday && <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">HOJE</span>}
            </div>

            <div className="space-y-4 flex-1">
                {children}
            </div>
        </div>
    );
}
