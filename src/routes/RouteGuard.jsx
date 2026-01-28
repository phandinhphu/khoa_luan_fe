import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const RouteGuard = ({ children, requiresAuth, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    
    console.log('RouteGuard:', { user, requiresAuth, allowedRoles });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (requiresAuth) {
        if (!user) {
            // Redirect to login if not logged in
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Redirect to appropriate page if logged in but role not allowed
            return <Navigate to="/403" replace />;
        }
    }

    // specific case: if user is logged in and tries to go to login or register page, redirect to home/dashboard
    // But this logic is usually handled inside Login/Register or via a specific "PublicOnlyRoute".
    // For now I will leave it as is, or we can add a `publicOnly` prop later if needed.

    return children;
};

export default RouteGuard;
