import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Heart, Zap, Star, Bookmark, Flame, Award } from 'lucide-react';
import { CustomList } from '@/types/media';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface CustomListsManagerProps {
  lists: CustomList[];
  activeList: string | null;
  onSelectList: (listId: string | null) => void;
  onAddList: (list: { name: string; description?: string; icon?: string; color?: string }) => void;
  onUpdateList: (id: string, updates: any) => void;
  onDeleteList: (id: string) => void;
  onAddMedia?: () => void;
}

const ICONS = [
  { name: 'Heart', icon: Heart },
  { name: 'Star', icon: Star },
  { name: 'Zap', icon: Zap },
  { name: 'Bookmark', icon: Bookmark },
  { name: 'Flame', icon: Flame },
  { name: 'Award', icon: Award },
];

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
];

export function CustomListsManager({
  lists,
  activeList,
  onSelectList,
  onAddList,
  onUpdateList,
  onDeleteList,
  onAddMedia,
}: CustomListsManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingList, setEditingList] = useState<CustomList | null>(null);
  const [newList, setNewList] = useState({
    name: '',
    description: '',
    icon: 'Heart',
    color: '#ef4444',
  });

  const handleCreate = () => {
    if (newList.name.trim()) {
      onAddList({
        name: newList.name,
        description: newList.description,
        icon: newList.icon,
        color: newList.color,
      });
      setNewList({
        name: '',
        description: '',
        icon: 'Heart',
        color: '#ef4444',
      });
      setIsCreateOpen(false);
    }
  };

  const handleUpdate = () => {
    if (editingList && editingList.name.trim()) {
      onUpdateList(editingList.id, {
        name: editingList.name,
        description: editingList.description,
        icon: editingList.icon,
        color: editingList.color,
      });
      setEditingList(null);
    }
  };

  const getIcon = (iconName: string = 'Heart') => {
    const found = ICONS.find((i) => i.name === iconName);
    return found ? found.icon : Heart;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="font-display text-lg text-foreground">Minhas Listas</h3>
      </div>

      {/* List Items */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => onSelectList(null)}
          className={cn(
            'px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
            activeList === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          Todos
        </button>

        {lists.map((list) => {
          const Icon = getIcon(list.icon);
          const isActive = activeList === list.id;
          const color = list.color || '#ef4444';

          return (
            <div key={list.id} className="relative group">
              <button
                onClick={() => onSelectList(list.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                  isActive
                    ? 'text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
                style={isActive ? { backgroundColor: color } : {}}
              >
                <Icon className="h-4 w-4" style={{ color: isActive ? 'inherit' : color }} />
                {list.name}
                <span className={cn("text-xs", isActive ? "opacity-80" : "opacity-50")}>
                  ({(list.itemIds || []).length})
                </span>
              </button>

              {/* Edit/Delete buttons on hover */}
              <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-1">
                <button
                  onClick={() => setEditingList(list)}
                  className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onDeleteList(list.id)}
                  className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/80"
                >
                  <Trash2 className="h-3 w-3 text-destructive-foreground" />
                </button>
              </div>
            </div>
          );
        })}

        {/* New List Button */}
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <button className="group flex items-center gap-0 px-2 py-1.5 rounded-xl text-sm font-medium transition-all border border-dashed border-primary/50 text-primary hover:bg-primary/5 hover:pr-3">
              <Plus className="h-4 w-4 shrink-0" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-[100px] group-hover:ml-1.5">
                Nova Lista
              </span>
            </button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="font-display text-2xl">Nova Lista</SheetTitle>
              <SheetDescription>
                Crie uma nova lista personalizada para organizar sua coleção.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={newList.name}
                  onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                  placeholder="Ex: Favoritos de Ação"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={newList.description}
                  onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                  placeholder="Descrição opcional"
                  className="rounded-xl"
                />
              </div>

              {/* Icon Selection */}
              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="flex gap-2 flex-wrap">
                  {ICONS.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setNewList({ ...newList, icon: name })}
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                        newList.icon === name
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewList({ ...newList, color })}
                      className={cn(
                        'w-8 h-8 rounded-full transition-all',
                        newList.color === color && 'ring-2 ring-ring ring-offset-2'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Button variant="gradient" onClick={handleCreate} className="w-full mt-4">
                Criar Lista
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Add Media Button (Right Aligned) */}
        {onAddMedia && (
          <div className="ml-auto">
            <Button
              variant="gradient"
              size="sm"
              onClick={onAddMedia}
              className="gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingList && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-card-foreground">Editar Lista</h3>
              <Button variant="ghost" size="icon" onClick={() => setEditingList(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={editingList.name}
                  onChange={(e) => setEditingList({ ...editingList, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={editingList.description}
                  onChange={(e) => setEditingList({ ...editingList, description: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              {/* Edit Icon */}
              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="flex gap-2 flex-wrap">
                  {ICONS.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setEditingList({ ...editingList, icon: name })}
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                        editingList.icon === name
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit Color */}
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingList({ ...editingList, color })}
                      className={cn(
                        'w-8 h-8 rounded-full transition-all',
                        editingList.color === color && 'ring-2 ring-ring ring-offset-2'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingList(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button variant="gradient" onClick={handleUpdate} className="flex-1">
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
