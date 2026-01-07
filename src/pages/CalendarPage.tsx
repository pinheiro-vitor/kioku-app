import { useState, useRef } from 'react';
import { useManualCalendar, ManualCalendarEntry } from '@/hooks/useManualCalendar';

import { Calendar as CalendarIcon, Plus, Share2, Loader2, Cloud, LogOut } from 'lucide-react';
import { CalendarAddModal } from '@/components/CalendarAddModal';
import { ManualCalendarCard } from '@/components/ManualCalendarCard';
import { AuthModal } from '@/components/AuthModal';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CalendarExportPreview } from '@/components/CalendarExportPreview';
import html2canvas from 'html2canvas';
import { imageCache } from '@/lib/imageCache';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { DroppableDayColumn } from '@/components/DroppableDayColumn';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';

const DAYS = [
    { id: 'monday', label: 'Segunda' },
    { id: 'tuesday', label: 'Terça' },
    { id: 'wednesday', label: 'Quarta' },
    { id: 'thursday', label: 'Quinta' },
    { id: 'friday', label: 'Sexta' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' },
];

export default function CalendarPage() {
    // Get current day of week (lowercased)
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();


    // Manual Calendar Hook
    const { getEntriesByDay, addEntry, removeEntry, updateEntry, moveEntry, entries, user } = useManualCalendar();

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<ManualCalendarEntry | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportEntries, setExportEntries] = useState<ManualCalendarEntry[]>([]);
    const [isPreparingExport, setIsPreparingExport] = useState(false);
    const [activeDragItem, setActiveDragItem] = useState<ManualCalendarEntry | null>(null);
    const { toast } = useToast();

    const exportRef = useRef<HTMLDivElement>(null);



    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (over && active.id !== over.id) {
            const targetDay = over.id as string;
            // Only update if day actually changed
            const entry = entries.find(e => e.id === active.id);
            if (entry && entry.dayOfWeek !== targetDay) {
                moveEntry(active.id as string, targetDay);
                toast({ title: 'Agendamento atualizado', description: `Movido para ${DAYS.find(d => d.id === targetDay)?.label}` });
            }
        }
    };

    const handleAddClick = () => {
        setEditingEntry(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (entry: ManualCalendarEntry) => {
        setEditingEntry(entry);
        setIsModalOpen(true);
    };

    const handleSubmit = (data: Omit<ManualCalendarEntry, 'id'>) => {
        if (editingEntry) {
            updateEntry(editingEntry.id, data);
            toast({ title: 'Entrada atualizada com sucesso.' });
        } else {
            addEntry(data);
            toast({ title: 'Adicionado ao calendário.' });
        }
        setIsModalOpen(false);
    };

    const handleDeleteEntry = (id: string) => {
        if (confirm('Tem certeza que deseja remover este anime do calendário?')) {
            removeEntry(id);
            toast({ title: 'Removido com sucesso.' });
        }
    };

    const convertImageUrlToBase64 = async (url: string): Promise<string> => {
        // 1. Check Cache First
        try {
            const cached = await imageCache.getImage(url);
            if (cached) return cached;
        } catch (e) {
            console.error('Cache read error', e);
        }

        const fetchImage = async (fetchUrl: string) => {
            const response = await fetch(fetchUrl, { mode: 'cors' });
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        };

        let result = url;

        // 2. Fetch Logic (Multi-proxy)
        const proxies = [
            '', // Direct fetch
            `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            `https://corsproxy.io/?${encodeURIComponent(url)}`
        ];

        let success = false;
        for (const proxyUrl of proxies) {
            try {
                const fetchUrl = proxyUrl ? proxyUrl : url;
                result = await fetchImage(fetchUrl);
                success = true;
                break; // Found it!
            } catch (error) {
                console.warn(`Fetch failed for ${proxyUrl || 'direct'}, trying next...`);
                continue;
            }
        }

        if (!success) {
            console.error('All proxies failed for image:', url);
            return url;
        }

        // 3. Save to Cache
        try {
            await imageCache.saveImage(url, result);
        } catch (e) {
            console.error('Cache save error', e);
        }

        return result;
    };

    const handleExport = async () => {
        try {
            setIsExporting(true);
            setIsPreparingExport(true);
            toast({ title: 'Iniciando exportação...', description: 'Processando imagens...' });

            // 1. Convert Imags with Concurrency Limit to avoid freezing UI
            const processedEntries = [...entries];
            const BATCH_SIZE = 3;

            for (let i = 0; i < processedEntries.length; i += BATCH_SIZE) {
                const batch = processedEntries.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(async (entry, index) => {
                    if (!entry.image) return;
                    const realIndex = i + index; // Track actual index in main array
                    processedEntries[realIndex] = {
                        ...entry,
                        image: await convertImageUrlToBase64(entry.image)
                    };
                }));

                // Yield to main thread to keep UI responsive
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            setExportEntries(processedEntries);

            // 2. Wait for state update and render
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (!exportRef.current) return;

            toast({ title: 'Gerando arquivo final...' });

            const canvas = await html2canvas(exportRef.current, {
                backgroundColor: '#09090b',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                onclone: (doc) => {
                    // Force final layout recalculation safely
                    const el = doc.getElementById('export-container');
                    if (el) el.style.display = 'block';
                }
            });

            const image = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = image;
            link.download = `calendar-kioku-${new Date().toISOString().split('T')[0]}.png`;
            link.click();

            toast({ title: 'Concluído!', description: 'Imagem salva.' });
        } catch (e) {
            console.error(e);
            toast({ title: 'Erro na exportação', variant: 'destructive' });
        } finally {
            setIsExporting(false);
            setIsPreparingExport(false);
            setExportEntries([]);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast({ title: 'Desconectado', description: 'Você saiu da sua conta.' });
    };

    return (
        <div>
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="h-8 w-8 text-primary" />
                            <h1 className="font-display text-3xl md:text-4xl text-foreground">
                                Calendário Pessoal
                            </h1>
                            {user ? (
                                <div className="ml-4 flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                    <Cloud className="h-3 w-3 text-green-500" />
                                    <span className="text-xs font-medium text-green-500">Sync Ativo</span>
                                    <button onClick={handleLogout} className="ml-2 hover:text-red-400 transition-colors" title="Sair">
                                        <LogOut className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="ml-4 flex items-center gap-2 px-3 py-1 bg-secondary/50 hover:bg-secondary border border-white/5 rounded-full transition-colors cursor-pointer group"
                                >
                                    <Cloud className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">Login / Sync</span>
                                </button>
                            )}
                        </div>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Adicione os animes que você está acompanhando e organize sua semana.
                        </p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Button onClick={() => setIsModalOpen(true)} className="gap-2 flex-1 md:flex-none">
                            <Plus className="h-4 w-4" /> Adicionar Anime
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="gap-2 flex-1 md:flex-none"
                            variant="outline"
                        >
                            {isExporting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...</>
                            ) : (
                                <><Share2 className="h-4 w-4" /> Exportar Imagem</>
                            )}
                        </Button>
                    </div>
                </div>



                <DndContext
                    sensors={sensors}
                    onDragStart={(e) => {
                        const entry = entries.find(x => x.id === e.active.id);
                        if (entry) setActiveDragItem(entry);
                    }}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
                        {DAYS.map((day) => {
                            const dayEntries = getEntriesByDay(day.id);
                            const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day.id;

                            return (
                                <DroppableDayColumn
                                    key={day.id}
                                    dayId={day.id}
                                    dayLabel={day.label}
                                    isToday={isToday}
                                >
                                    {dayEntries.map((entry) => (
                                        <ManualCalendarCard
                                            key={entry.id}
                                            entry={entry}
                                            onEdit={() => setEditingEntry(entry)}
                                            onDelete={() => handleDeleteEntry(entry.id)}
                                        />
                                    ))}
                                    {dayEntries.length === 0 && (
                                        <div className="h-full flex items-center justify-center min-h-[100px] border-2 border-dashed border-white/5 rounded-xl">
                                            <span className="text-muted-foreground/30 text-xs">Arraste aqui</span>
                                        </div>
                                    )}
                                </DroppableDayColumn>
                            );
                        })}
                    </div>

                    {createPortal(
                        <DragOverlay>
                            {activeDragItem ? (
                                <div className="w-[280px] opacity-90 rotate-3 cursor-grabbing">
                                    <ManualCalendarCard
                                        entry={activeDragItem}
                                        onEdit={() => { }}
                                        onDelete={() => { }}
                                    />
                                </div>
                            ) : null}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>


            </main>

            <CalendarAddModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingEntry}
            />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => setIsAuthModalOpen(false)}
            />

            <div className="fixed top-0 left-[-9999px] -z-50 opacity-0 pointer-events-none">
                <div className="p-10 bg-[#09090b] w-max" id="export-container">
                    {(isPreparingExport || exportEntries.length > 0) && (
                        <CalendarExportPreview entries={exportEntries} ref={exportRef} />
                    )}
                </div>
            </div>
        </div>
    );
}
