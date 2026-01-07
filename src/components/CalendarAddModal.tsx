import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ManualCalendarEntry } from '@/hooks/useManualCalendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface CalendarAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (entry: Omit<ManualCalendarEntry, 'id'>) => void;
    initialData?: ManualCalendarEntry | null;
}

const DAYS = [
    { id: 'monday', label: 'Segunda-feira' },
    { id: 'tuesday', label: 'Terça-feira' },
    { id: 'wednesday', label: 'Quarta-feira' },
    { id: 'thursday', label: 'Quinta-feira' },
    { id: 'friday', label: 'Sexta-feira' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' },
];

const STREAMING_OPTIONS = [
    "Crunchyroll",
    "Netflix",
    "Disney+",
    "Amazon Prime",
    "HBO Max",
    "AnimeOnegai",
    "Apple TV+",
    "Alternativo" // Pirata/Other
];

interface JikanAnime {
    mal_id: number;
    title: string;
    images: {
        jpg: {
            large_image_url: string;
        };
    };
    broadcast?: {
        day?: string;
    };
}

export function CalendarAddModal({ isOpen, onClose, onSubmit, initialData }: CalendarAddModalProps) {
    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [day, setDay] = useState('sunday');
    const [streaming, setStreaming] = useState<string[]>([]);
    const [time, setTime] = useState('');

    // Search States
    const [suggestions, setSuggestions] = useState<JikanAnime[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const debouncedTitle = useDebounce(title, 500);
    const [openCombobox, setOpenCombobox] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setImage(initialData.image || '');
                setDay(initialData.dayOfWeek);
                setStreaming(initialData.streaming || []);
                setTime(initialData.time || '');
            } else {
                resetForm();
            }
            setShowSuggestions(false);
        }
    }, [isOpen, initialData]);

    // Outside click handler for suggestions
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Jikan Search Effect
    useEffect(() => {
        const searchAnime = async () => {
            if (!debouncedTitle || debouncedTitle.length < 3 || initialData) return;

            // If user just selected a suggestion (exact match), don't search again immediately
            if (!showSuggestions && suggestions.length > 0) return;

            setIsSearching(true);
            try {
                const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(debouncedTitle)}&limit=5&sfw=true`);
                const data = await response.json();
                setSuggestions(data.data || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Jikan API Error:", error);
            } finally {
                setIsSearching(false);
            }
        };

        searchAnime();
    }, [debouncedTitle]);

    const handleSelectSuggestion = (anime: JikanAnime) => {
        setTitle(anime.title);
        setImage(anime.images.jpg.large_image_url);

        // Try to guess day? Jikan returns "Mondays", need to map
        // Keeping it manual for now to avoid errors, or basic mapping:
        if (anime.broadcast?.day) {
            const jikanDay = anime.broadcast.day.toLowerCase().replace('s', ''); // Mondays -> monday
            if (DAYS.some(d => d.id === jikanDay)) {
                setDay(jikanDay);
            }
        }

        setShowSuggestions(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            image: image || undefined,
            dayOfWeek: day,
            streaming,
            time: time || undefined
        });
        onClose();
    };

    const resetForm = () => {
        setTitle('');
        setImage('');
        setDay('sunday');
        setStreaming([]);
        setTime('');
        setSuggestions([]);
    };

    const toggleStreaming = (option: string) => {
        if (streaming.includes(option)) {
            setStreaming(streaming.filter(s => s !== option));
        } else {
            setStreaming([...streaming, option]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] overflow-visible">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Editar Anime' : 'Adicionar ao Calendário'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    {/* Title with Auto-Complete */}
                    <div className="grid gap-2 relative" ref={wrapperRef}>
                        <Label htmlFor="title" className="flex items-center gap-2">
                            Título do Anime
                            {isSearching && <Loader2 className="h-3 w-3 animate-spin text-purple-500" />}
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (!initialData) setShowSuggestions(true);
                            }}
                            onFocus={() => {
                                if (suggestions.length > 0 && !initialData) setShowSuggestions(true);
                            }}
                            placeholder="Digite para buscar..."
                            required
                            autoComplete="off"
                        />

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#1a1a20] border border-white/10 rounded-md shadow-xl overflow-hidden">
                                <ul className="max-h-[240px] overflow-y-auto">
                                    {suggestions.map((anime) => (
                                        <li
                                            key={anime.mal_id}
                                            onClick={() => handleSelectSuggestion(anime)}
                                            className="flex items-center gap-3 p-2 hover:bg-white/5 cursor-pointer transition-colors"
                                        >
                                            <div className="h-10 w-8 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                                                <img src={anime.images.jpg.large_image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-100 truncate">{anime.title}</p>
                                                <p className="text-xs text-gray-500">{anime.broadcast?.day || 'Dia desconhecido'}</p>
                                            </div>
                                            <Sparkles className="h-3 w-3 text-purple-500 opacity-0 group-hover:opacity-100" />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="day">Dia de Lançamento</Label>
                        <Select value={day} onValueChange={setDay}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o dia" />
                            </SelectTrigger>
                            <SelectContent>
                                {DAYS.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Onde Assistir</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between"
                                >
                                    {streaming.length > 0
                                        ? `${streaming.length} selecionado(s)`
                                        : "Selecione as plataformas..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandList>
                                        <CommandGroup>
                                            {STREAMING_OPTIONS.map((option) => (
                                                <CommandItem
                                                    key={option}
                                                    value={option}
                                                    onSelect={() => toggleStreaming(option)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            streaming.includes(option) ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {option}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {streaming.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {streaming.map(s => (
                                    <span key={s} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="time">Horário (Opcional)</Label>
                        <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="image" className="flex items-center gap-2">
                            URL da Imagem
                            {image && <ImageIcon className="h-3 w-3 text-green-500" />}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="image"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="https://..."
                            />
                            {image && (
                                <div className="h-10 w-10 rounded border border-white/10 overflow-hidden flex-shrink-0">
                                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-500">Auto-preenchido pela busca</p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">{initialData ? 'Salvar' : 'Adicionar'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
