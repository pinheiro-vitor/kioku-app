import { Moon, Sun, Plus, BookOpen, BarChart3, Menu, User, Calendar, Compass, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onAddNew?: () => void;
  onToggleStats?: () => void;
  showStats?: boolean;
  hideNavigation?: boolean;
}

export function Header({
  theme = 'light',
  onToggleTheme = () => { },
  onAddNew = () => { },
  onToggleStats = () => { },
  showStats = false,
  hideNavigation = false
}: HeaderProps) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <div className="relative flex items-center justify-center bg-transparent group-hover:bg-primary/10 transition-colors rounded-xl p-1">
              {/* Totoro Logo */}
              <div className="absolute inset-0 bg-primary/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src="https://img.icons8.com/color/48/totoro.png"
                alt="Kioku Logo"
                className="h-12 w-12 object-contain relative z-10"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-none tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                Kioku
              </span>
              <p className="text-[10px] text-muted-foreground hidden sm:block leading-none tracking-widest uppercase mt-0.5">
                Library
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!hideNavigation && (
            <nav className="hidden md:flex items-center gap-1 bg-card/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl shadow-black/20">
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 rounded-full transition-all duration-300 px-5 py-2",
                    location.pathname === '/dashboard'
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/library">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 rounded-full transition-all duration-300 px-5 py-2",
                    location.pathname === '/library'
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  Biblioteca
                </Button>
              </Link>
              <Link to="/header_browse_placeholder" className="hidden" />
              <Link to="/browse">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 rounded-full transition-all duration-300 px-5 py-2",
                    location.pathname === '/browse'
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Compass className="h-4 w-4" />
                  Explorar
                </Button>
              </Link>
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 rounded-full transition-all duration-300 px-5 py-2",
                    location.pathname === '/profile'
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <User className="h-4 w-4" />
                  Perfil
                </Button>
              </Link>
              <Link to="/calendar">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 rounded-full transition-all duration-300 px-5 py-2",
                    location.pathname === '/calendar'
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  Calendário
                </Button>
              </Link>
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!hideNavigation && (
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="hidden md:flex rounded-full text-muted-foreground hover:text-destructive transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}

            <Button
              variant="kioku"
              size="icon"
              onClick={onToggleTheme}
              className={cn(
                'rounded-full transition-all duration-500',
                theme === 'dark' && 'rotate-180'
              )}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile Menu */}
            <div className="md:hidden">
              {!hideNavigation && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="kioku" size="icon" className="rounded-full">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2 w-full cursor-pointer">
                        <BarChart3 className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/library" className="flex items-center gap-2 w-full cursor-pointer">
                        <BookOpen className="h-4 w-4" />
                        Biblioteca
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/browse" className="flex items-center gap-2 w-full cursor-pointer">
                        <Compass className="h-4 w-4" />
                        Explorar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 w-full cursor-pointer">
                        <User className="h-4 w-4" />
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/calendar" className="flex items-center gap-2 w-full cursor-pointer">
                        <Calendar className="h-4 w-4" />
                        Calendário
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onAddNew} className="gap-2 text-primary focus:text-primary font-medium">
                      <Plus className="h-4 w-4" />
                      Adicionar Item
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="gap-2 text-destructive focus:text-destructive font-medium border-t">
                      <LogOut className="h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
