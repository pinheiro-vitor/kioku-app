
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { toast } = useToast();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                toast({ title: 'Verifique seu email', description: 'Um link de confirmação foi enviado.' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast({ title: 'Login realizado com sucesso!' });
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error.message || 'Ocorreu um erro na autenticação',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isSignUp ? 'Criar Conta' : 'Login no Kioku Cloud'}</DialogTitle>
                    <DialogDescription>
                        {isSignUp
                            ? 'Crie uma conta para sincronizar seus dados.'
                            : 'Entre para acessar seus animes salvos.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAuth} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSignUp ? 'Criar Conta' : 'Entrar'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar conta'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
