import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from '@/components/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Lazy load pages
const NotFound = lazy(() => import('./pages/NotFound'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const PublicHome = lazy(() => import('@/pages/PublicHome'));
const BrowsePage = lazy(() => import('@/pages/BrowsePage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const LibraryPage = lazy(() => import('@/pages/LibraryPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary onReset={reset}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<PublicHome />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<HomePage />} />
                        <Route path="/library" element={<LibraryPage />} />
                        <Route path="/browse" element={<BrowsePage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                      </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;
