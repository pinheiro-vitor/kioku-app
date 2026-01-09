import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/login', {
                email,
                password
            });

            login(response.data.access_token, response.data.user);

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Falha ao fazer login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl shadow-kioku">
                <div className="text-center">
                    <h2 className="text-3xl font-display text-card-foreground">Bem-vindo de volta</h2>
                    <p className="mt-2 text-muted-foreground">Faça login para acessar sua biblioteca</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1"
                                placeholder="seu@email.com"
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
                    </div>

                    {error && <p className="text-destructive text-sm text-center">{error}</p>}

                    <Button type="submit" className="w-full btn-primary-gradient">
                        Entrar
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Não tem uma conta? </span>
                    <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                        Registre-se
                    </Link>
                </div>
            </div>
        </div>
    );
}
