import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirmation) {
            setError('As senhas não coincidem');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                    }
                }
            });

            if (error) throw error;

            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Falha ao registrar');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl shadow-kioku">
                <div className="text-center">
                    <h2 className="text-3xl font-display text-card-foreground">Crie sua conta</h2>
                    <p className="mt-2 text-muted-foreground">Comece a organizar sua coleção hoje</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password_confirmation">Confirmar Senha</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                required
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {error && <p className="text-destructive text-sm text-center">{error}</p>}

                    <Button type="submit" className="w-full btn-primary-gradient">
                        Registrar
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Já tem uma conta? </span>
                    <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                        Faça login
                    </Link>
                </div>
            </div>
        </div>
    );
}
