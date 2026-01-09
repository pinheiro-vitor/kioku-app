import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Entries
    const { data: entries = [], isLoading } = useQuery({
        queryKey: ['calendar-entries', user?.id],
        queryFn: async () => {
            // Local first? 
            // Ideally we just fetch from API. 
            // Merging local with API is complex, let's assume API is source of truth after migration.
            // But if we want to "Migrate Local", we should do it once.

            if (!user) {
                const saved = localStorage.getItem(STORAGE_KEY);
                return saved ? JSON.parse(saved) : [];
            }

            const { data } = await api.get('/calendar');
            return data.map((item: any) => ({
                id: item.id,
                title: item.title,
                image: item.image,
                dayOfWeek: item.day_of_week,
                streaming: item.streaming || [],
                time: item.time
            }));
        },
        enabled: true // Always run so we get local if no user
    });

    // Sync Local Data to Cloud (One-time check)
    useEffect(() => {
        if (user && entries.length === 0) {
            const checkAndSync = async () => {
                const local = localStorage.getItem(STORAGE_KEY);
                if (local) {
                    const localEntries: ManualCalendarEntry[] = JSON.parse(local);
                    if (localEntries.length > 0) {
                        toast({ title: 'Sincronizando...', description: 'Enviando seus dados locais para a nuvem.' });
                        try {
                            await Promise.all(localEntries.map(entry =>
                                api.post('/calendar', {
                                    title: entry.title,
                                    image: entry.image,
                                    day_of_week: entry.dayOfWeek,
                                    streaming: entry.streaming,
                                    time: entry.time
                                })
                            ));
                            toast({ title: 'Sincronização completa!' });
                            queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
                            localStorage.removeItem(STORAGE_KEY); // Clear local after sync
                        } catch (e) {
                            console.error(e);
                            toast({ title: 'Erro ao sincronizar', variant: 'destructive' });
                        }
                    }
                }
            };
            checkAndSync();
        }
    }, [user, entries.length]);


    // Mutations
    const addEntryMutation = useMutation({
        mutationFn: async (entry: Omit<ManualCalendarEntry, 'id'>) => {
            if (!user) {
                // Local only
                const tempId = crypto.randomUUID();
                const newEntry = { ...entry, id: tempId };
                const newEntries = [...entries, newEntry];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
                return newEntry;
            }
            const { data } = await api.post('/calendar', {
                title: entry.title,
                image: entry.image,
                day_of_week: entry.dayOfWeek,
                streaming: entry.streaming,
                time: entry.time
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
        }
    });

    const updateEntryMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<ManualCalendarEntry> }) => {
            if (!user) {
                const newEntries = entries.map(e => e.id === id ? { ...e, ...updates } : e);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
                return;
            }
            // Map updates to snake_case
            const payload: any = {};
            if (updates.title) payload.title = updates.title;
            if (updates.image) payload.image = updates.image;
            if (updates.dayOfWeek) payload.day_of_week = updates.dayOfWeek;
            if (updates.streaming) payload.streaming = updates.streaming;
            if (updates.time) payload.time = updates.time;

            await api.put(`/calendar/${id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
        }
    });

    const removeEntryMutation = useMutation({
        mutationFn: async (id: string) => {
            if (!user) {
                const newEntries = entries.filter(e => e.id !== id);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
                return;
            }
            await api.delete(`/calendar/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
        }
    });

    const moveEntryMutation = useMutation({
        mutationFn: async ({ id, targetDay }: { id: string, targetDay: string }) => {
            if (!user) {
                const newEntries = entries.map(e => e.id === id ? { ...e, dayOfWeek: targetDay } : e);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
                return;
            }
            await api.put(`/calendar/${id}`, { day_of_week: targetDay });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
        }
    });

    const getEntriesByDay = (dayId: string) => {
        return entries.filter((e: ManualCalendarEntry) => e.dayOfWeek.toLowerCase() === dayId.toLowerCase());
    };

    return {
        entries,
        getEntriesByDay,
        addEntry: addEntryMutation.mutate,
        removeEntry: removeEntryMutation.mutate,
        updateEntry: (id: string, updates: Partial<ManualCalendarEntry>) => updateEntryMutation.mutate({ id, updates }),
        moveEntry: (id: string, targetDay: string) => moveEntryMutation.mutate({ id, targetDay }),
        user,
        isLoading
    };
}
