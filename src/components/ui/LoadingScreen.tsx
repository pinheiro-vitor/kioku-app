import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export function LoadingScreen() {
    const [show, setShow] = useState(true);

    // Optional: Safety timeout to ensure it doesn't get stuck forever if something fails silently
    useEffect(() => {
        // The component is controlled by Suspense unmounting it, 
        // but we can add internal logic if needed for exit animations.
        return () => setShow(false);
    }, []);

    return (
        <div className={cn(
            "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background",
            "transition-opacity duration-500",
            show ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            <div className="relative flex flex-col items-center">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />

                {/* Animated Icon Container */}
                <div className="relative bg-card p-6 rounded-3xl shadow-2xl border border-white/10 mb-8 animate-bounce-slow">
                    <Sparkles className="w-12 h-12 text-primary animate-spin-slow" />
                </div>

                {/* Text with Gradient */}
                <h1 className="text-3xl font-display font-medium tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x mb-4">
                    KIOKU
                </h1>

                {/* Loading Bar */}
                <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-loading-bar rounded-full" />
                </div>

                <p className="mt-4 text-sm text-muted-foreground animate-pulse">
                    Organizando suas memórias...
                </p>
            </div>
        </div>
    );
}
