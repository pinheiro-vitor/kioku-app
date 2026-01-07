import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

import { Mail, Calendar, TrendingUp, Clock, Play, BookOpen, CheckCircle, Trophy, X, Heart, Medal, Star, Sword, Anchor, Zap, FlaskConical, Ghost, Search, Globe, Bot, Brain, Activity, User as UserIcon, Lock, Settings, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface UserProfileProps { }

interface Stats {
    totalItems: number;
    totalAnime: number;
    totalManga: number;
    completedItems: number;
    watchingItems: number;
    totalEpisodes: number;
    totalChapters: number;
    totalHours: number;
    totalDays: number;
    topGenres: { name: string; value: number }[];
    droppedItems: number;
    meanScore: number;
    statusDistribution: { name: string; value: number; color: string }[];
    // Themed stats
    romanceItems: number;
    romComItems: number;
    actionItems: number;
    adventureItems: number;
    shounenItems: number;
    fantasyItems: number;
    supernaturalItems: number;
    mysteryItems: number;
    isekaiItems: number;
    mechaItems: number;
    psychItems: number;
}

// Colors for top genres (Brighter Palette)
const genreColors = ['#f472b6', '#c084fc', '#818cf8', '#22d3ee', '#34d399']; // pink, purple, indigo, cyan, emerald

export default function UserProfile({ }: UserProfileProps) {
    const { user, updateProfile } = useAuth();
    const { theme } = useTheme();
    const { items } = useMediaLibrary();
    const { toast } = useToast();

    // Edit Form State
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editConfirmPassword, setEditConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

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
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString(),
                });

            if (updateError) throw updateError;

            toast({ title: 'Sucesso', description: 'Foto de perfil atualizada!' });

            // Force reload to update context (temporary solution)
            window.location.reload();

        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast({ title: 'Erro', description: 'Falha ao atualizar foto.', variant: 'destructive' });
        } finally {
            setIsUpdating(false);
        }
    };

    const [stats, setStats] = useState<Stats | null>(null);
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [nextLevelXp, setNextLevelXp] = useState(0);

    useEffect(() => {
        if (!items || items.length === 0) {
            setStats({
                totalItems: 0,
                totalAnime: 0,
                totalManga: 0,
                completedItems: 0,
                watchingItems: 0,
                totalEpisodes: 0,
                totalChapters: 0,
                totalHours: 0,
                totalDays: 0,
                topGenres: [],
                droppedItems: 0,
                meanScore: 0,
                statusDistribution: [],
                romanceItems: 0,
                romComItems: 0,
                actionItems: 0,
                adventureItems: 0,
                shounenItems: 0,
                fantasyItems: 0,
                supernaturalItems: 0,
                mysteryItems: 0,
                isekaiItems: 0,
                mechaItems: 0,
                psychItems: 0
            });
            setLevel(1);
            setXp(0);
            setNextLevelXp(0);
            return;
        }

        const totalItems = items.length;
        const totalAnime = items.filter(item => item.type === 'anime').length;
        const totalManga = items.filter(item => item.type === 'manga').length;
        const completedItems = items.filter(item => item.status === 'completed').length;
        const watchingItems = items.filter(item => item.status === 'watching' || item.status === 'reading').length;

        let totalEpisodes = 0;
        let totalChapters = 0;
        let totalMinutes = 0;

        const genreCounts: { [key: string]: number } = {};

        items.forEach(item => {
            if (item.type === 'anime' && item.currentEpisode) {
                totalEpisodes += item.currentEpisode;
                // Assuming standard duration of 24 minutes as MediaItem doesn't track duration yet
                totalMinutes += item.currentEpisode * 24;
            } else if (item.type === 'manga' && item.currentChapter) {
                totalChapters += item.currentChapter;
            }

            item.genres.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
        });

        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);

        const sortedGenres = Object.entries(genreCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5) // Top 5
            .map(([name, value]) => ({ name, value }));



        const calculatedStats = {
            totalItems,
            totalAnime,
            totalManga,
            completedItems,
            watchingItems,
            totalEpisodes,
            totalChapters,
            totalHours,
            totalDays,
            topGenres: sortedGenres,
        };

        // XP and Level Calculation
        const totalXp = totalItems * 10 + completedItems * 50 + totalEpisodes * 2 + totalChapters * 1;
        let currentLevel = 1;
        let xpNeededForNextLevel = 100;

        while (totalXp >= xpNeededForNextLevel) {
            currentLevel++;
            xpNeededForNextLevel = 100 * Math.pow(currentLevel, 2);
        }

        const currentLevelBaseXp = 100 * Math.pow(currentLevel - 1, 2);
        const nextLevelBaseXp = 100 * Math.pow(currentLevel, 2);
        const levelProgress = ((totalXp - currentLevelBaseXp) / (nextLevelBaseXp - currentLevelBaseXp)) * 100;

        const droppedItems = items.filter(i => i.status === 'dropped').length;
        const romanceItems = items.filter(i => i.genres.includes('Romance')).length;
        const romComItems = items.filter(i => i.genres.includes('Romance') && i.genres.includes('Comedy')).length;

        // Themed Stats
        const actionItems = items.filter(i => i.genres.includes('Ação')).length;
        const adventureItems = items.filter(i => i.genres.includes('Aventura')).length;
        const shounenItems = items.filter(i => i.genres.includes('Shounen')).length;
        const fantasyItems = items.filter(i => i.genres.includes('Fantasia')).length;
        const supernaturalItems = items.filter(i => i.genres.includes('Sobrenatural')).length;
        const mysteryItems = items.filter(i => i.genres.includes('Mistério')).length;
        const isekaiItems = items.filter(i => i.genres.includes('Isekai')).length;
        const mechaItems = items.filter(i => i.genres.includes('Mecha')).length;
        const psychItems = items.filter(i => i.genres.includes('Psicológico')).length;

        const ratedItems = items.filter(i => i.score > 0);
        const meanScore = ratedItems.length > 0
            ? Number((ratedItems.reduce((acc, curr) => acc + curr.score, 0) / ratedItems.length).toFixed(2))
            : 0;

        const statusDistribution = [
            { name: 'Completo', value: completedItems, color: '#22c55e' }, // green-500
            { name: 'Assistindo/Lendo', value: watchingItems, color: '#3b82f6' }, // blue-500
            { name: 'Planejado', value: items.filter(i => i.status === 'plan-to-watch').length, color: '#eab308' }, // yellow-500
            { name: 'Pausado', value: items.filter(i => i.status === 'on-hold').length, color: '#f97316' }, // orange-500
            { name: 'Abandonado', value: droppedItems, color: '#ef4444' }, // red-500
        ].filter(item => item.value > 0);

        setStats({
            ...calculatedStats,
            topGenres: sortedGenres,
            droppedItems,
            meanScore,
            statusDistribution,
            romanceItems,
            romComItems,
            actionItems,
            adventureItems,
            shounenItems,
            fantasyItems,
            supernaturalItems,
            mysteryItems,
            isekaiItems,
            mechaItems,
            psychItems
        });

        setLevel(currentLevel);
        setXp(totalXp);
        setNextLevelXp(levelProgress);

    }, [items]);

    if (!stats) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Badges Logic
    const badges = [
        { id: 'starter', name: 'Iniciante', description: 'Criou sua conta no Kioku.', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10', condition: true },
        { id: 'collector', name: 'Colecionador', description: 'Adicionou 10 itens à biblioteca.', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', condition: stats.totalItems >= 10 },
        { id: 'otaku', name: 'Otaku', description: 'Adicionou 20 animes à biblioteca.', icon: Play, color: 'text-red-500', bg: 'bg-red-500/10', condition: stats.totalAnime >= 20 },
        { id: 'reader', name: 'Leitor Ávido', description: 'Adicionou 20 mangás à biblioteca.', icon: BookOpen, color: 'text-green-500', bg: 'bg-green-500/10', condition: stats.totalManga >= 20 },
        { id: 'veteran', name: 'Veterano', description: 'Alcançou o nível 10.', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10', condition: level >= 10 },
        { id: 'dropout', name: 'Desapegado', description: 'Abandonou 20 obras.', icon: X, color: 'text-orange-500', bg: 'bg-orange-500/10', condition: stats.droppedItems >= 20 },
        { id: 'romantic', name: 'Romântico', description: '20 obras de Romance na lista.', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10', condition: stats.romanceItems >= 20 },
        { id: 'romcom', name: 'Mestre da RomCom', description: '20 obras de Romance + Comédia.', icon: Medal, color: 'text-rose-500', bg: 'bg-rose-500/10', condition: stats.romComItems >= 20 },

        // Themed Badges
        { id: 'hunter', name: 'Hunter', description: '20 obras de Ação.', icon: Sword, color: 'text-orange-600', bg: 'bg-orange-600/10', condition: stats.actionItems >= 20 },
        { id: 'pirate', name: 'Rei dos Piratas', description: '20 obras de Aventura.', icon: Anchor, color: 'text-blue-600', bg: 'bg-blue-600/10', condition: stats.adventureItems >= 20 },
        { id: 'ninja', name: 'Shinobi', description: '20 obras Shounen.', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-600/10', condition: stats.shounenItems >= 20 },
        { id: 'alchemist', name: 'Alquimista Federal', description: '20 obras de Fantasia.', icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-600/10', condition: stats.fantasyItems >= 20 },
        { id: 'shinigami', name: 'Shinigami', description: '20 obras Sobrenaturais.', icon: Ghost, color: 'text-slate-500', bg: 'bg-slate-500/10', condition: stats.supernaturalItems >= 20 },
        { id: 'detective', name: 'Detetive', description: '15 obras de Mistério.', icon: Search, color: 'text-amber-700', bg: 'bg-amber-700/10', condition: stats.mysteryItems >= 15 },
        { id: 'traveler', name: 'Isekai Traveler', description: '15 obras Isekai.', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-600/10', condition: stats.isekaiItems >= 15 },
        { id: 'pilot', name: 'Piloto EVA', description: '10 obras Mecha.', icon: Bot, color: 'text-indigo-500', bg: 'bg-indigo-500/10', condition: stats.mechaItems >= 10 },
        { id: 'mastermind', name: 'Mastermind', description: '15 obras Psicológicas.', icon: Brain, color: 'text-fuchsia-600', bg: 'bg-fuchsia-600/10', condition: stats.psychItems >= 15 },
    ];

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
                            Lvl {level}
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
                                <span>XP: {Math.floor(xp)}</span>
                                <span>Próximo Nível</span>
                            </div>
                            <Progress value={nextLevelXp} className="h-2" />
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
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <Activity className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="text-3xl font-bold">{stats.totalItems}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total de Itens</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur-sm border-yellow-500/20">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                                    <div className="p-3 bg-yellow-500/10 rounded-full">
                                        <Star className="h-6 w-6 text-yellow-500" />
                                    </div>
                                    <div className="text-3xl font-bold">{stats.meanScore}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Nota Média</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur-sm border-blue-500/20">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                                    <div className="p-3 bg-blue-500/10 rounded-full">
                                        <Clock className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div className="text-3xl font-bold">{stats.totalDays}d</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tempo de Vida</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur-sm border-green-500/20">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                                    <div className="p-3 bg-green-500/10 rounded-full">
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div className="text-3xl font-bold">{stats.completedItems}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Completados</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Distribution Chart */}
                            <Card className="bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden relative">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 relative z-10">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Distribuição
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px] relative">
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                                        <Activity className="h-64 w-64" />
                                    </div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.statusDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90} // Thicker
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {stats.statusDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                                itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span style={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}>{value}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Genres Chart */}
                            <Card className="bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden relative">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 relative z-10">
                                        <BookOpen className="h-5 w-5 text-primary" />
                                        Top Gêneros
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px] relative">
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                                        <Ghost className="h-64 w-64" />
                                    </div>
                                    {stats.topGenres.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.topGenres}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90} // Thicker donut
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {stats.topGenres.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={genreColors[index % genreColors.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                                                />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span style={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}>{value}</span>} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                            <Search className="h-8 w-8 opacity-50" />
                                            <p>Sem dados suficientes</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
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
