import { useEffect, useState } from 'react';
import { jikanService, JikanCharacter } from '@/services/jikanService';
import { Loader2, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CharacterListProps {
    malId: number;
}

export function CharacterList({ malId }: CharacterListProps) {
    const [characters, setCharacters] = useState<JikanCharacter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCharacters = async () => {
            setIsLoading(true);
            try {
                const response = await jikanService.getAnimeCharacters(malId);
                // Sort by role (Main first) and take top 12 to avoid clutter
                const sorted = response.data
                    .sort((a, b) => (a.role === 'Main' ? -1 : 1))
                    .slice(0, 12);
                setCharacters(sorted);
            } catch (err) {
                console.error('Failed to load characters', err);
                setError('Failed to load characters');
            } finally {
                setIsLoading(false);
            }
        };

        if (malId) {
            fetchCharacters();
        }
    }, [malId]);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || characters.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma informação de elenco encontrada.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            {characters.map((item) => (
                <div key={item.character.mal_id} className="flex items-center gap-3 bg-secondary/20 p-2 rounded-xl">
                    {/* Character */}
                    <div className="relative shrink-0">
                        <img
                            src={item.character.images.webp.image_url}
                            alt={item.character.name}
                            className="h-16 w-16 object-cover rounded-lg bg-muted"
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{item.character.name}</h4>
                        <Badge variant={item.role === 'Main' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1">
                            {item.role === 'Main' ? 'Principal' : 'Coadjuvante'}
                        </Badge>
                    </div>

                    {/* VA (Japanese usually first) */}
                    {item.voice_actors && item.voice_actors.length > 0 && (
                        <div className="flex items-center gap-2 text-right pl-2 border-l border-border/50">
                            <div className="hidden sm:block">
                                <p className="text-xs font-medium truncate max-w-[80px]">{item.voice_actors[0].person.name}</p>
                                <p className="text-[10px] text-muted-foreground">{item.voice_actors[0].language}</p>
                            </div>
                            <img
                                src={item.voice_actors[0].person.images.jpg.image_url}
                                alt={item.voice_actors[0].person.name}
                                className="h-12 w-12 object-cover rounded-full bg-muted border-2 border-background"
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
