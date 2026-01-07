import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddNew: () => void;
}

export function EmptyState({ onAddNew }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6 animate-float">
        <BookOpen className="h-12 w-12 text-primary" />
      </div>
      
      <h3 className="font-display text-2xl text-foreground mb-2">
        Sua biblioteca está vazia
      </h3>
      
      <p className="text-muted-foreground max-w-md mb-6">
        Comece a construir sua coleção adicionando seus animes, mangás e manhwas favoritos.
      </p>
      
      <Button variant="gradient" size="lg" onClick={onAddNew} className="gap-2">
        <Plus className="h-5 w-5" />
        Adicionar Primeiro Item
      </Button>
    </div>
  );
}
