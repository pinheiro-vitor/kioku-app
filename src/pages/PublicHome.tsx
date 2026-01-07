import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Star, Shield, Zap } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Header } from '@/components/Header';

export default function PublicHome() {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-background">
            <Header theme={theme} onToggleTheme={toggleTheme} hideNavigation={true} />

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm animate-fade-in">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                            Kioku 2.0
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-display text-foreground animate-slide-up">
                            Sua Jornada Anime <br />
                            <span className="text-gradient">Começa Aqui.</span>
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up-delay-1">
                            Uma plataforma moderna e elegante para rastrear, descobrir e organizar seus animes e mangás favoritos. Sem distrações, apenas você e sua coleção.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-slide-up-delay-2">
                            <Link to="/register">
                                <Button size="lg" className="rounded-full px-8 h-12 text-lg gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                                    Começar Agora <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-lg hover:bg-secondary/50">
                                    Fazer Login
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-slow"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse-slow delay-1000"></div>
                    <div className="absolute inset-0 bg-grid-white/5 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"></div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-secondary/20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={BookOpen}
                            title="Organização Completa"
                            description="Mantenha seus animes e mangás em listas personalizadas. Acompanhe episódios, capítulos e volumes com precisão."
                        />
                        <FeatureCard
                            icon={Star}
                            title="Descoberta Inteligente"
                            description="Encontre sua próxima obra favorita com nosso sistema de busca avançada e recomendações baseadas no seu gosto."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Design Premium"
                            description="Uma interface fluida, responsiva e focada na melhor experiência de usuário possível. Modo escuro incluso."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Kioku. Feito com <span className="text-red-500">♥</span> para fãs de anime.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-card-foreground">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
    );
}
