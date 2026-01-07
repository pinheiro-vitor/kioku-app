import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AddToScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    day: string;
    items: MediaItem[]; // List of candidate items (e.g. watching anime)
    onAssign: (itemId: string, day: string) => void;
}

export function AddToScheduleModal({
    isOpen,
    onClose,
    day,
    items,
    onAssign,
}: AddToScheduleModalProps) {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const filteredItems = items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                    <h2 className="font-display text-xl text-card-foreground">
                        Adicionar a {day}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar anime assistindo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                            autoFocus
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {filteredItems.length > 0 ? (
                            filteredItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        onAssign(item.id, day);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors border border-transparent",
                                        item.broadcastDay === day
                                            ? "bg-primary/10 border-primary/20 hover:bg-primary/20"
                                            : "hover:bg-secondary/50 border-border/30 bg-card/50"
                                    )}
                                >
                                    <img
                                        src={item.coverImage}
                                        alt={item.title}
                                        className="w-10 h-14 object-cover rounded-md bg-muted"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-card-foreground truncate">{item.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            {item.broadcastDay && item.broadcastDay !== day && (
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 opacity-70">
                                                    {item.broadcastDay}
                                                </Badge>
                                            )}
                                            {item.broadcastDay === day && (
                                                <Badge className="text-[10px] h-5 px-1.5 bg-primary/20 text-primary border-primary/20">
                                                    Adicionado
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {item.broadcastDay !== day && (
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full shrink-0">
                                            <PlusIcon className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                Nenhum anime "Assistindo" encontrado.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
