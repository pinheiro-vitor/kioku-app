import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export interface ManualCalendarEntry {
    id: string;
    title: string;
    image?: string;
    dayOfWeek: string;
    streaming: string[];
    time?: string;
}

const STORAGE_KEY = 'kioku_manual_calendar_v1';

export function useManualCalendar() {
    const [entries, setEntries] = useState<ManualCalendarEntry[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // 1. Initialize & Auth Listener
    useEffect(() => {
        // Load local first for instant render
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setEntries(JSON.parse(saved));
        }

        // Check Session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session) {
                // If logged out, keep local data or clear? 
                // Let's reload local storage to be sure
                const local = localStorage.getItem(STORAGE_KEY);
                setEntries(local ? JSON.parse(local) : []);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Fetch Data when User changes
    useEffect(() => {
        if (!user) return;

        const fetchEntries = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('calendar_entries')
                .select('*');

            if (error) {
                console.error('Error fetching entries:', error);
                toast({ title: 'Erro ao sincronizar', description: 'Não foi possível buscar seus dados.', variant: 'destructive' });
                setIsLoading(false);
                return;
            }

            if (data && data.length > 0) {
                // Map Supabase (snake_case) to App (camelCase)
                const mappedEntries: ManualCalendarEntry[] = data.map(item => ({
                    id: item.id,
                    title: item.title,
                    image: item.image,
                    dayOfWeek: item.day_of_week,
                    streaming: item.streaming || [],
                    time: item.time
                }));
                setEntries(mappedEntries);
                // Also update local storage as cache
                localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedEntries));
            } else {
                // If cloud is empty but we have local data, ask to sync? 
                // For now, let's Auto-Migrate Local -> Cloud
                const local = localStorage.getItem(STORAGE_KEY);
                if (local) {
                    const localEntries: ManualCalendarEntry[] = JSON.parse(local);
                    if (localEntries.length > 0) {
                        toast({ title: 'Sincronizando...', description: 'Enviando seus dados locais para a nuvem.' });
                        const insertPromises = localEntries.map(entry =>
                            supabase.from('calendar_entries').insert({
                                user_id: user.id,
                                title: entry.title,
                                image: entry.image,
                                day_of_week: entry.dayOfWeek,
                                streaming: entry.streaming,
                                time: entry.time
                            })
                        );
                        const results = await Promise.all(insertPromises);
                        const hasErrors = results.some(res => res.error);

                        if (hasErrors) {
                            toast({ title: 'Erro na sincronização', description: 'Alguns dados podem não ter sido enviados.', variant: 'destructive' });
                        } else {
                            toast({ title: 'Sincronização completa', description: 'Seus dados locais foram enviados para a nuvem.' });
                        }

                        // Refetch to get IDs and ensure consistency
                        const { data: newData, error: newDataError } = await supabase.from('calendar_entries').select('*');
                        if (newDataError) {
                            console.error('Error refetching after migration:', newDataError);
                            toast({ title: 'Erro ao verificar dados', description: 'Não foi possível confirmar a sincronização.', variant: 'destructive' });
                        } else if (newData) {
                            const mapped = newData.map(item => ({
                                id: item.id,
                                title: item.title,
                                image: item.image,
                                dayOfWeek: item.day_of_week,
                                streaming: item.streaming || [],
                                time: item.time
                            }));
                            setEntries(mapped);
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
                        }
                    }
                }
            }
            setIsLoading(false);
        };

        fetchEntries();
    }, [user]);

    // Helper to sync changes
    const save = (newEntries: ManualCalendarEntry[]) => {
        setEntries(newEntries);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    };

    const addEntry = async (entry: Omit<ManualCalendarEntry, 'id'>) => {
        // Optimistic Update
        const tempId = crypto.randomUUID();
        const newEntry = { ...entry, id: tempId };
        const newEntries = [...entries, newEntry];
        save(newEntries);

        if (user) {
            const { data, error } = await supabase
                .from('calendar_entries')
                .insert({
                    user_id: user.id,
                    title: entry.title,
                    image: entry.image,
                    day_of_week: entry.dayOfWeek,
                    streaming: entry.streaming,
                    time: entry.time
                })
                .select()
                .single();

            if (error) {
                console.error(error);
                toast({ title: 'Erro ao salvar na nuvem', variant: 'destructive' });
                // Revert optimistic update if cloud save fails
                setEntries(current => {
                    const reverted = current.filter(e => e.id !== tempId);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(reverted));
                    return reverted;
                });
            } else if (data) {
                // Replace temp ID with real ID
                setEntries(current => {
                    const updated = current.map(e => e.id === tempId ? { ...e, id: data.id } : e);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                    return updated;
                });
            }
        }
    };

    const removeEntry = async (id: string) => {
        const newEntries = entries.filter(e => e.id !== id);
        save(newEntries);

        if (user) {
            const { error } = await supabase.from('calendar_entries').delete().eq('id', id);
            if (error) {
                console.error(error);
                toast({ title: 'Erro ao deletar na nuvem', variant: 'destructive' });
                // Revert optimistic update
                setEntries(current => {
                    const reverted = [...current, entries.find(e => e.id === id)!]; // Re-add the removed entry
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(reverted));
                    return reverted;
                });
            }
        }
    };

    const updateEntry = async (id: string, updates: Partial<ManualCalendarEntry>) => {
        const oldEntry = entries.find(e => e.id === id);
        const newEntries = entries.map(e => e.id === id ? { ...e, ...updates } : e);
        save(newEntries);

        if (user) {
            const dbUpdates: any = {};
            if (updates.title !== undefined) dbUpdates.title = updates.title;
            if (updates.image !== undefined) dbUpdates.image = updates.image;
            if (updates.dayOfWeek !== undefined) dbUpdates.day_of_week = updates.dayOfWeek;
            if (updates.streaming !== undefined) dbUpdates.streaming = updates.streaming;
            if (updates.time !== undefined) dbUpdates.time = updates.time;

            const { error } = await supabase.from('calendar_entries').update(dbUpdates).eq('id', id);
            if (error) {
                console.error(error);
                toast({ title: 'Erro ao atualizar na nuvem', variant: 'destructive' });
                // Revert optimistic update
                setEntries(current => {
                    const reverted = current.map(e => e.id === id ? oldEntry! : e);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(reverted));
                    return reverted;
                });
            }
        }
    };

    const moveEntry = async (id: string, targetDay: string) => {
        const oldEntry = entries.find(e => e.id === id);
        const newEntries = entries.map(e => e.id === id ? { ...e, dayOfWeek: targetDay } : e);
        save(newEntries);

        if (user) {
            const { error } = await supabase.from('calendar_entries').update({ day_of_week: targetDay }).eq('id', id);
            if (error) {
                console.error(error);
                toast({ title: 'Erro ao mover na nuvem', variant: 'destructive' });
                // Revert optimistic update
                setEntries(current => {
                    const reverted = current.map(e => e.id === id ? oldEntry! : e);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(reverted));
                    return reverted;
                });
            }
        }
    };

    const getEntriesByDay = (dayId: string) => {
        return entries.filter(e => e.dayOfWeek.toLowerCase() === dayId.toLowerCase());
    };

    return {
        entries,
        getEntriesByDay,
        addEntry,
        removeEntry,
        updateEntry,
        moveEntry,
        user,
        isLoading
    };
}
