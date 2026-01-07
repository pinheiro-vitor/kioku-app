import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute() {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to landing page, but save the current location they were trying to go to
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <Outlet />;
}
