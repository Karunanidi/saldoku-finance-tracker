import { useState, ReactNode } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/features/auth/services/authService';

interface AppLayoutProps {
    children: ReactNode;
    title: string;
    showAddButton?: boolean;
}

export const AppLayout = ({ children, title, showAddButton = true }: AppLayoutProps) => {
    const { user, setSession } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await authService.logout();
        setSession(null);
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path ? 'bg-primary/10 text-primary font-bold' : 'text-[#616e89] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors';

    return (
        <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-hidden max-w-md mx-auto shadow-2xl transition-colors duration-300">

            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[60] transition-all duration-300 backdrop-blur-sm ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            {/* Side Menu (Drawer) */}
            <aside
                className={`fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-gray-900 z-[70] transition-transform duration-300 shadow-2xl overflow-y-auto ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">SaldoKu</h2>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email}</p>
                        </div>
                    </div>
                    <nav className="space-y-1">
                        <button onClick={() => navigate('/')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${isActive('/')}`}>
                            <span className="material-symbols-outlined">home</span>
                            <span>Dashboard</span>
                        </button>
                        <button onClick={() => navigate('/analytics')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${isActive('/analytics')}`}>
                            <span className="material-symbols-outlined">pie_chart</span>
                            <span>Analytics</span>
                        </button>
                        <button onClick={() => navigate('/history')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${isActive('/history')}`}>
                            <span className="material-symbols-outlined">receipt_long</span>
                            <span>Transactions</span>
                        </button>
                        <button onClick={() => navigate('/scan')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${isActive('/scan')}`}>
                            <span className="material-symbols-outlined">document_scanner</span>
                            <span>Scan Receipt</span>
                        </button>
                        <hr className="my-4 border-gray-100 dark:border-gray-800" />
                        <button onClick={() => navigate('/settings')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${isActive('/settings')}`}>
                            <span className="material-symbols-outlined">settings</span>
                            <span>Settings</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span>Sign Out</span>
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Header */}
            <header className="shrink-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between z-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-[#111318] dark:text-white"
                    >
                        <span className="material-symbols-outlined text-2xl">menu</span>
                    </button>
                    <h1 className="text-lg font-bold text-[#111318] dark:text-white leading-tight">{title}</h1>
                </div>
                {/* Header Actions (Optional) */}
                <div className="flex items-center gap-2">
                    {/* Add extra header buttons here if needed */}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative no-scrollbar">
                {children}
            </main>

            {/* Floating Action Button */}
            {showAddButton && (
                <button
                    onClick={() => navigate('/scan')}
                    className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-transform active:scale-95 z-40"
                >
                    <span className="material-symbols-outlined text-3xl">document_scanner</span>
                </button>
            )}
        </div>
    );
};
