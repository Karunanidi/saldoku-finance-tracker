import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

export const ProtectedRoute = () => {
    const { session, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
