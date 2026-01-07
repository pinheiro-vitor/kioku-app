import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './Header';
import { useTheme } from '@/hooks/useTheme';
import { MediaFormModal } from '@/components/MediaFormModal';
import { MediaItem } from '@/types/media';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useReleaseNotifications } from '@/hooks/useReleaseNotifications';

export function AppLayout() {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { addItem } = useMediaLibrary();
    const { toast } = useToast();

    // Enable Release Notifications
    useReleaseNotifications();

    // Global Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formItem, setFormItem] = useState<Partial<MediaItem> | undefined>(undefined);

    const handleAddNew = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setFormItem(undefined);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (data: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>) => {
        addItem(data);
        setIsFormOpen(false);
        toast({
            title: 'Adicionado com sucesso',
            description: `"${data.title}" foi adicionado à sua biblioteca.`,
        });
    };

    return (
        <div className="min-h-screen font-sans antialiased text-foreground relative selection:bg-primary/30 isolate">
            <Header
                theme={theme}
                onToggleTheme={toggleTheme}
                onAddNew={handleAddNew}
            />
            <main>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            <MediaFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={formItem as MediaItem}
                mode="add"
            />

            {/* Explicit Background Layers */}
            {/* 1. Cinematic Noise / Grain - Top Layer for Texture */}
            <div
                className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* 2. Grid Pattern - Deepest Layer */}
            <div
                className="fixed inset-0 pointer-events-none z-[-2]"
                style={{
                    backgroundImage: 'radial-gradient(hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
                }}
            />

            {/* 3. Particles - Middle Layer (Sharp, memory-like) */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-40">
                {/* Floating particles implemented via CSS background-image for performance */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-30 blur-3xl transform translate-x-[-20%] translate-y-[-20%]" />

                {/* We can use a simple repeated SVG pattern or CSS dots */}
                <div className="absolute top-0 left-0 w-full h-full"
                    style={{
                        backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1.5px, transparent 1.5px), radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)',
                        backgroundSize: '60px 60px, 100px 100px',
                        backgroundPosition: '0 0, 30px 30px',
                        opacity: 0.3
                    }}
                />
            </div>
        </div>
    );
}
