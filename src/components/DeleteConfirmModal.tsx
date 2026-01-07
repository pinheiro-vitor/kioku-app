import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  itemTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-display text-xl text-card-foreground">
              Confirmar Exclusão
            </h3>
            <p className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita
            </p>
          </div>
        </div>

        <p className="text-card-foreground mb-6">
          Tem certeza que deseja excluir{' '}
          <span className="font-semibold">"{itemTitle}"</span> da sua biblioteca?
        </p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1">
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}
