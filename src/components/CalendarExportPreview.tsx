import { ManualCalendarEntry } from '@/hooks/useManualCalendar';
import { StreamingPlatformIcon } from './StreamingPlatformIcon';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { PlayCircle } from 'lucide-react';

interface CalendarExportPreviewProps {
    entries: ManualCalendarEntry[];
}

const DAYS = [
    { id: 'monday', label: 'SEGUNDA' },
    { id: 'tuesday', label: 'TERÇA' },
    { id: 'wednesday', label: 'QUARTA' },
    { id: 'thursday', label: 'QUINTA' },
    { id: 'friday', label: 'SEXTA' },
    { id: 'saturday', label: 'SÁBADO' },
    { id: 'sunday', label: 'DOMINGO' },
];

export const CalendarExportPreview = forwardRef<HTMLDivElement, CalendarExportPreviewProps>(({ entries }, ref) => {
    // Group entries by day
    const entriesByDay: Record<string, ManualCalendarEntry[]> = {};
    DAYS.forEach(day => {
        entriesByDay[day.id] = entries.filter(e => e.dayOfWeek === day.id);
    });

    const RowOneDays = DAYS.slice(0, 4); // Mon - Thu
    const RowTwoDays = DAYS.slice(4, 7); // Fri - Sun

    const renderDayColumn = (day: typeof DAYS[0], isWide: boolean = false) => {
        const dayEntries = entriesByDay[day.id];

        return (
            <div key={day.id} className={cn(
                "flex flex-col bg-[#121217] rounded-3xl overflow-hidden border border-white/5",
                isWide ? "col-span-1" : "col-span-1"
            )}>
                {/* Header */}
                <div className="bg-[#1a1a20] px-6 py-5 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-3xl font-black text-white uppercase tracking-wider">{day.label}</h2>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-6 flex-1 min-h-[350px]">
                    {dayEntries.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-white/10 opacity-50">
                            <div className="w-1.5 h-12 bg-white/10 mb-2 rounded-full" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-5">
                            {dayEntries.map(entry => (
                                <div key={entry.id} className="group relative flex flex-col gap-3">
                                    <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden shadow-lg bg-gray-900 border border-white/10">
                                        {entry.image ? (
                                            <img
                                                src={entry.image}
                                                alt=""
                                                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                <PlayCircle className="w-8 h-8 text-white/20" />
                                            </div>
                                        )}

                                        {/* Time Badge - Overlay */}
                                        {entry.time && (
                                            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-md border border-white/10 shadow-sm">
                                                {entry.time}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 px-1">
                                        <h4 className="font-bold text-lg text-gray-50 leading-tight line-clamp-2 min-h-[2.5em] drop-shadow-md">
                                            {entry.title}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {entry.streaming.map(platform => (
                                                <div key={platform} className="bg-white/10 p-1.5 rounded-md border border-white/5 opacity-80" title={platform}>
                                                    <StreamingPlatformIcon platform={platform.toLowerCase()} size={16} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className="w-[1920px] bg-[#09090b] text-white font-sans relative flex flex-col p-12 overflow-hidden"
        >
            {/* Background Effects */}
            <div className="absolute top-[-200px] right-[-200px] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

            {/* Header */}
            <div className="z-10 mb-10 flex items-end justify-between border-b border-white/10 pb-6">
                <div className="flex flex-col">
                    <span className="text-purple-400 font-bold tracking-[0.3em] text-sm mb-2 uppercase">Sua Agenda Semanal</span>
                    <h1 className="text-7xl font-black font-display tracking-tight text-white leading-none">
                        CALENDÁRIO <span className="text-purple-500">BOLOLO</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4 bg-[#121217] px-6 py-3 rounded-2xl border border-white/10">
                    <div className="text-right">
                        <span className="block text-xl font-bold text-white">{entries.length}</span>
                        <span className="block text-xs text-gray-500 uppercase tracking-wider font-bold">Lançamentos</span>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div className="text-right">
                        <span className="block text-xl font-bold text-white">{new Date().getFullYear()}</span>
                        <span className="block text-xs text-gray-500 uppercase tracking-wider font-bold">Temporada</span>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="z-10 flex flex-col gap-6">
                {/* Row 1: Mon - Thu */}
                <div className="grid grid-cols-4 gap-6">
                    {RowOneDays.map(day => renderDayColumn(day))}
                </div>

                {/* Row 2: Fri - Sun (Expanded) */}
                <div className="grid grid-cols-3 gap-6">
                    {RowTwoDays.map(day => renderDayColumn(day, true))}
                </div>
            </div>

            {/* Footer */}
            <div className="z-10 mt-10 flex justify-between items-center text-sm text-gray-600 font-medium">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Personal Anime Schedule</span>
                </div>
                <span>kioku.app</span>
            </div>
        </div>
    );
});

CalendarExportPreview.displayName = "CalendarExportPreview";
