import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useAuthStore } from '@/features/auth/store/authStore';
import { supabase } from '@/core/api/supabase';
import { useNavigate } from 'react-router-dom';

export const SettingsPage = () => {
    const { user } = useAuthStore();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize theme from document class or local storage
        if (document.documentElement.classList.contains('dark')) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    }, []);

    const toggleTheme = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleDeleteAllData = async () => {
        if (!confirm("Are you sure? This will delete ALL your transactions. This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            if (!user) return;
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;

            alert("All data deleted successfully.");
            navigate('/');
        } catch (error) {
            console.error("Error deleting data:", error);
            alert("Failed to delete data.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AppLayout title="Settings" showAddButton={false}>
            <div className="flex flex-col gap-2 pb-10">
                <h3 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-6">Account Information</h3>
                <div className="bg-white dark:bg-gray-900 mx-4 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-4 px-4 min-h-14 justify-between border-b border-gray-100 dark:border-gray-800">
                        <p className="text-[#111318] dark:text-gray-300 text-base font-normal leading-normal flex-1 truncate">Email</p>
                        <div className="shrink-0">
                            <p className="text-primary dark:text-blue-400 text-base font-medium leading-normal">{user?.email}</p>
                        </div>
                    </div>
                    {/* Placeholder for Password Change - requires Auth API flow */}
                    <div className="flex items-center gap-4 px-4 min-h-14 justify-between active:bg-gray-50 dark:active:bg-gray-800 cursor-pointer transition-colors opacity-50 pointer-events-none">
                        <p className="text-[#111318] dark:text-gray-300 text-base font-normal leading-normal flex-1 truncate">Change Password</p>
                        <div className="shrink-0 text-gray-400">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </div>
                    </div>
                </div>

                <h3 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-6">App Preferences</h3>
                <div className="bg-white dark:bg-gray-900 mx-4 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-4 px-4 min-h-14 justify-between border-b border-gray-100 dark:border-gray-800">
                        <p className="text-[#111318] dark:text-gray-300 text-base font-normal leading-normal flex-1 truncate">Currency</p>
                        <div className="flex items-center gap-2 shrink-0">
                            <p className="text-gray-500 dark:text-gray-400 text-base font-normal">IDR (Rp)</p>
                            <span className="material-symbols-outlined text-gray-400">lock</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 px-4 min-h-14 justify-between border-b border-gray-100 dark:border-gray-800">
                        <p className="text-[#111318] dark:text-gray-300 text-base font-normal leading-normal flex-1 truncate">Appearance</p>
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            <button
                                onClick={() => toggleTheme('light')}
                                className={`px-3 py-1 rounded shadow-sm text-sm font-semibold transition-all ${theme === 'light' ? 'bg-white text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Light
                            </button>
                            <button
                                onClick={() => toggleTheme('dark')}
                                className={`px-3 py-1 rounded shadow-sm text-sm font-semibold transition-all ${theme === 'dark' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Dark
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 px-4 min-h-14 justify-between">
                        <p className="text-[#111318] dark:text-gray-300 text-base font-normal leading-normal flex-1 truncate">AI Smart Insights</p>
                        <div className="shrink-0">
                            {/* Mock Toggle */}
                            <div className="w-12 h-6 bg-primary rounded-full relative flex items-center px-1 cursor-pointer">
                                <div className="size-4 bg-white rounded-full absolute right-1"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 pt-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-red-600 dark:text-red-500 text-xl font-bold">warning</span>
                        <h3 className="text-red-600 dark:text-red-500 text-lg font-bold leading-tight tracking-[-0.015em]">Danger Zone</h3>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                        Deleting all data is permanent and cannot be undone. This will remove all your synced transactions.
                    </p>
                    <button
                        onClick={handleDeleteAllData}
                        disabled={isDeleting}
                        className="w-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <span className="flex items-center gap-2">Processing...</span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">delete</span>
                                Delete All Data
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-8 px-4 text-center">
                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">SALDOKU AI V2.4.1</p>
                    <p className="text-gray-400 text-[10px] mt-1">OCR Engine: VisionCore Pro • AI Model: Insights-V3</p>
                </div>
            </div>
        </AppLayout>
    );
};
