import { Link } from 'react-router-dom';

export const ContactAdminPage = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark p-4 font-display">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg text-center">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-4xl">lock</span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Restricted Access</h2>

                <p className="text-gray-600 dark:text-gray-300">
                    This application is currently not open for public registration.
                    Please contact the administrator to request an account.
                </p>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Administrator Contact
                    </p>
                    <a href="mailto:admin@saldoku.com" className="text-primary font-bold text-lg hover:underline">
                        admin@saldoku.com
                    </a>
                </div>

                <div className="pt-4">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg mr-1">arrow_back</span>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};
