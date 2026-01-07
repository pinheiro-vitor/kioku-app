import { useEffect, useRef } from 'react';
import { useManualCalendar } from '@/hooks/useManualCalendar';
import { useToast } from '@/hooks/use-toast';

export function useReleaseNotifications() {
    const { toast } = useToast();
    const { getEntriesByDay } = useManualCalendar();

    // Get current day of week (lowercased)
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Ref to track if we already checked in this session/render cycle
    const hasChecked = useRef(false);

    useEffect(() => {
        // Wait for data to be ready or if checked
        if (hasChecked.current) return;

        // Get manual entries for today
        const todayReleases = getEntriesByDay(today);

        if (!todayReleases || todayReleases.length === 0) return;

        // Check local storage to see if we already notified today
        const lastNotifiedDate = localStorage.getItem('kioku_last_notification_date');
        const currentDateStr = new Date().toISOString().split('T')[0];

        if (lastNotifiedDate === currentDateStr) {
            return;
        }

        if (todayReleases.length > 0) {
            const displayTitles = todayReleases
                .slice(0, 2) // Show first 2
                .map(t => t.title)
                .join(', ');

            const remaining = todayReleases.length - 2;
            const suffix = remaining > 0 ? ` e mais ${remaining} obra(s).` : '.';

            toast({
                title: '📅 Lançamentos de Hoje!',
                description: `Hoje tem: ${displayTitles}${suffix}`,
                duration: 8000,
            });

            // Mark as notified today
            localStorage.setItem('kioku_last_notification_date', currentDateStr);
        }

        hasChecked.current = true;

    }, [today, toast, getEntriesByDay]);
}
