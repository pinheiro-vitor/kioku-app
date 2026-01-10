import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { StatisticsPanel } from '@/components/StatisticsPanel';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

import { Mail, Calendar, TrendingUp, Clock, Play, BookOpen, CheckCircle, Trophy, X, Heart, Medal, Star, Sword, Anchor, Zap, FlaskConical, Ghost, Search, Globe, Bot, Brain, Activity, User as UserIcon, Lock, Settings, Camera } from 'lucide-react';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface UserProfileProps { }

export default function UserProfile({ }: UserProfileProps) {
    const { user, updateProfile } = useAuth();
    const { theme } = useTheme();
    const { items, getStatistics } = useMediaLibrary(); // Added getStatistics
    const { toast } = useToast();

    // Edit Form State
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editConfirmPassword, setEditConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Get Base Stats from Hook
    const baseStats = useMemo(() => getStatistics(), [getStatistics, items]);

    // Calculate Themed Stats for Badges (Local only)
    const themedStats = useMemo(() => {
        if (!items) return {};
        const countGenre = (genre: string) => items.filter(i => i.genres?.includes(genre)).length;

        return {
            romanceItems: countGenre('Romance'),
            romComItems: items.filter(i => i.genres?.includes('Romance') && i.genres?.includes('Comedy')).length,
            actionItems: countGenre('Ação'),
            adventureItems: countGenre('Aventura'),
            shounenItems: countGenre('Shounen'),
            fantasyItems: countGenre('Fantasia'),
            supernaturalItems: countGenre('Sobrenatural'),
            mysteryItems: countGenre('Mistério'),
            isekaiItems: countGenre('Isekai'),
            mechaItems: countGenre('Mecha'),
            psychItems: countGenre('Psicológico'),
        };
    }, [items]);

    // Level System Logic
    const { currentLevel, nextLevelProgress, totalXp } = useMemo(() => {
        const xp = baseStats.totalItems * 10 +
            baseStats.completedItems * 50 +
            baseStats.totalEpisodes * 2 +
            baseStats.totalChapters * 1;

        let level = 1;
        let xpNeeded = 100;
        while (xp >= xpNeeded) {
            level++;
            xpNeeded = 100 * Math.pow(level, 2);
        }

        const currentBase = 100 * Math.pow(level - 1, 2);
        const nextBase = 100 * Math.pow(level, 2);
        const progress = ((xp - currentBase) / (nextBase - currentBase)) * 100;

        return { currentLevel: level, nextLevelProgress: progress, totalXp: xp };
    }, [baseStats]);


    useEffect(() => {
        if (user) {
            setEditName(user.name);
            setEditEmail(user.email);
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        if (editPassword && editPassword !== editConfirmPassword) {
            toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
            setIsUpdating(false);
            return;
        }

        try {
            await updateProfile({
                name: editName,
                email: editEmail,
                password: editPassword || undefined
            });
            toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!' });
            setEditPassword('');
            setEditConfirmPassword('');
        } catch (error) {
            toast({ title: 'Erro', description: 'Falha ao atualizar perfil.', variant: 'destructive' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        try {
            setIsUpdating(true);
            const formData = new FormData();
            formData.append('avatar', file);

            const { data } = await api.post('/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast({ title: 'Sucesso', description: 'Foto de perfil atualizada!' });
            // Reload page to reflect changes
            window.location.reload();

        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast({ title: 'Erro', description: 'Falha ao atualizar foto.', variant: 'destructive' });
        } finally {
            setIsUpdating(false);
        }
    };

    // Badges Definition
    const badges = [
        { id: 'starter', name: 'Iniciante', description: 'Criou sua conta no Kioku.', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10', condition: true },
        { id: 'collector', name: 'Colecionador', description: 'Adicionou 10 itens à biblioteca.', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', condition: baseStats.totalItems >= 10 },
        { id: 'otaku', name: 'Otaku', description: 'Adicionou 20 animes à biblioteca.', icon: Play, color: 'text-red-500', bg: 'bg-red-500/10', condition: baseStats.totalAnime >= 20 },
        { id: 'reader', name: 'Leitor Ávido', description: 'Adicionou 20 mangás à biblioteca.', icon: BookOpen, color: 'text-green-500', bg: 'bg-green-500/10', condition: baseStats.totalManga >= 20 },
        { id: 'veteran', name: 'Veterano', description: 'Alcançou o nível 10.', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10', condition: currentLevel >= 10 },
        { id: 'dropout', name: 'Desapegado', description: 'Abandonou 20 obras.', icon: X, color: 'text-orange-500', bg: 'bg-orange-500/10', condition: baseStats.droppedItems >= 20 },
        // Themed Badges
        { id: 'romantic', name: 'Romântico', description: '20 obras de Romance na lista.', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10', condition: (themedStats.romanceItems || 0) >= 20 },
        { id: 'romcom', name: 'Mestre da RomCom', description: '20 obras de Romance + Comédia.', icon: Medal, color: 'text-rose-500', bg: 'bg-rose-500/10', condition: (themedStats.romComItems || 0) >= 20 },
        { id: 'hunter', name: 'Hunter', description: '20 obras de Ação.', icon: Sword, color: 'text-orange-600', bg: 'bg-orange-600/10', condition: (themedStats.actionItems || 0) >= 20 },
        { id: 'pirate', name: 'Rei dos Piratas', description: '20 obras de Aventura.', icon: Anchor, color: 'text-blue-600', bg: 'bg-blue-600/10', condition: (themedStats.adventureItems || 0) >= 20 },
        { id: 'ninja', name: 'Shinobi', description: '20 obras Shounen.', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-600/10', condition: (themedStats.shounenItems || 0) >= 20 },
        { id: 'alchemist', name: 'Alquimista Federal', description: '20 obras de Fantasia.', icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-600/10', condition: (themedStats.fantasyItems || 0) >= 20 },
        { id: 'shinigami', name: 'Shinigami', description: '20 obras Sobrenaturais.', icon: Ghost, color: 'text-slate-500', bg: 'bg-slate-500/10', condition: (themedStats.supernaturalItems || 0) >= 20 },
        { id: 'detective', name: 'Detetive', description: '15 obras de Mistério.', icon: Search, color: 'text-amber-700', bg: 'bg-amber-700/10', condition: (themedStats.mysteryItems || 0) >= 15 },
        { id: 'traveler', name: 'Isekai Traveler', description: '15 obras Isekai.', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-600/10', condition: (themedStats.isekaiItems || 0) >= 15 },
        { id: 'pilot', name: 'Piloto EVA', description: '10 obras Mecha.', icon: Bot, color: 'text-indigo-500', bg: 'bg-indigo-500/10', condition: (themedStats.mechaItems || 0) >= 10 },
        { id: 'mastermind', name: 'Mastermind', description: '15 obras Psicológicas.', icon: Brain, color: 'text-fuchsia-600', bg: 'bg-fuchsia-600/10', condition: (themedStats.psychItems || 0) >= 15 },
    ];

    if (!items) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="pb-20 md:pb-0">
            <main className="container mx-auto px-4 pt-8 pb-12 space-y-8 animate-fade-in">
                {/* User Profile Header */}
                <div className="bg-card rounded-3xl p-8 shadow-kioku border border-border flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="h-64 w-64" />
                    </div>

                    <div className="relative group cursor-pointer">
                        <input
                            type="file"
                            id="avatar-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={isUpdating}
                        />
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-xl transition-opacity group-hover:opacity-80">
                                <AvatarImage src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} className="object-cover" />
                                <AvatarFallback className="text-4xl">{user?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                        </label>
                        <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-background">
                            Lvl {currentLevel}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4 z-10">
                        <div>
                            <h1 className="font-display text-4xl text-card-foreground">{user?.name}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mt-1">
                                <Mail className="h-4 w-4" />
                                <span>{user?.email}</span>
                            </div>
                        </div>

                        <div className="space-y-2 max-w-md mx-auto md:mx-0">
                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                <span>XP: {Math.floor(totalXp)}</span>
                                <span>Próximo Nível</span>
                            </div>
                            <Progress value={nextLevelProgress} className="h-2" />
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <Badge variant="secondary" className="px-3 py-1">
                                <Calendar className="h-3 w-3 mr-2" />
                                Membro desde 2024
                            </Badge>
                            {badges.filter(b => b.condition).map(badge => (
                                <Badge key={badge.id} variant="outline" className={`px-3 py-1 ${badge.color} ${badge.bg} border-current`}>
                                    <badge.icon className="h-3 w-3 mr-2" />
                                    {badge.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="badges">Conquistas</TabsTrigger>
                        <TabsTrigger value="edit">Editar Perfil</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8 animate-slide-up">
                        {/* Statistics Panel */}
                        <StatisticsPanel stats={baseStats} />
                    </TabsContent>


                    <TabsContent value="edit" className="animate-slide-up">
                        <Card className="max-w-2xl mx-auto bg-card border-border shadow-kioku">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-primary" />
                                    Editar Perfil
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Apelido</Label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="pl-9"
                                                placeholder="Seu nome de usuário"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={editEmail}
                                                onChange={(e) => setEditEmail(e.target.value)}
                                                className="pl-9"
                                                placeholder="seu@email.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Nova Senha (Opcional)</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={editPassword}
                                                    onChange={(e) => setEditPassword(e.target.value)}
                                                    className="pl-9"
                                                    placeholder="********"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={editConfirmPassword}
                                                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                                                    className="pl-9"
                                                    placeholder="********"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" className="min-w-[120px]" disabled={isUpdating}>
                                            {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>


                    </TabsContent>

                    <TabsContent value="badges" className="animate-slide-up">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {badges.map((badge) => (
                                <Card key={badge.id} className={`group relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${badge.condition ? 'border-primary/50 bg-card' : 'border-dashed border-muted bg-muted/20 opacity-60 grayscale'}`}>
                                    {badge.condition && (
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent -mr-8 -mt-8 rotate-45 blur-xl group-hover:opacity-100 transition-opacity" />
                                    )}
                                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4 relative z-10">
                                        <div className={`p-4 rounded-full shadow-lg ${badge.condition ? badge.bg : 'bg-muted'}`}>
                                            <badge.icon className={`h-8 w-8 ${badge.condition ? badge.color : 'text-muted-foreground'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight mb-1">{badge.name}</h3>
                                            <p className="text-xs text-muted-foreground leading-relaxed h-8 flex items-center justify-center">
                                                {badge.description}
                                            </p>
                                        </div>
                                        {badge.condition && (
                                            <Badge variant="outline" className="border-primary/50 text-xs bg-primary/5">
                                                Desbloqueado
                                            </Badge>
                                        )}
                                    </CardContent>
                                    {badge.condition && (
                                        <div className="absolute inset-0 border-2 border-primary/20 rounded-xl pointer-events-none group-hover:border-primary/50 transition-colors" />
                                    )}
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
