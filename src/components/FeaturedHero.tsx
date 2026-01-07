import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FeaturedHeroProps {
    items: MediaItem[];
    onPlay: (item: MediaItem) => void;
    onMoreInfo: (item: MediaItem) => void;
}

export function FeaturedHero({ items, onPlay, onMoreInfo }: FeaturedHeroProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate
    useEffect(() => {
        if (items.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [items.length]);

    if (!items || items.length === 0) return null;

    const currentItem = items[currentIndex];

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    return (
        <div className="relative w-full h-[55vh] min-h-[450px] rounded-3xl overflow-hidden mb-8 group bg-black">
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {/* Background Image with Parallax/Ken Burns */}
                    <motion.div
                        className="absolute inset-0 bg-cover bg-[center_25%]"
                        style={{ backgroundImage: `url(${currentItem.bannerImage || currentItem.coverImage})` }}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, ease: "linear" }}
                    />

                    {/* Overlays */}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-8 md:p-12 max-w-4xl z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentItem.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-accent text-accent-foreground border-none px-3 py-1 text-sm font-medium backdrop-blur-md shadow-lg">
                                Destaque
                            </Badge>
                            {currentItem.score > 0 && (
                                <Badge variant="outline" className="text-white border-white/30 backdrop-blur-md gap-1.5 pl-2.5 pr-3">
                                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                    <span className="font-semibold">{currentItem.score.toFixed(1)}</span>
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 drop-shadow-xl line-clamp-2">
                            {currentItem.title}
                        </h1>

                        <p className="text-white/80 line-clamp-3 md:line-clamp-2 max-w-2xl mb-8 text-lg font-light drop-shadow-md">
                            {currentItem.synopsis || "Sem sinopse disponível."}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Button
                                size="lg"
                                className="rounded-full px-8 py-6 text-lg font-semibold bg-white text-black hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                onClick={() => onPlay(currentItem)}
                            >
                                <Play className="mr-2 h-5 w-5 fill-black" />
                                {currentItem.type === 'anime' ? 'Assistir' : 'Ler Agora'}
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-full px-8 py-6 text-lg font-semibold bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                                onClick={() => onMoreInfo(currentItem)}
                            >
                                <Info className="mr-2 h-5 w-5" />
                                Detalhes
                            </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 right-8 flex items-center gap-4 z-20">
                <div className="flex gap-2">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                idx === currentIndex ? "w-8 bg-white" : "bg-white/40 hover:bg-white/60"
                            )}
                        />
                    ))}
                </div>

                <div className="flex gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handlePrev}
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleNext}
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
