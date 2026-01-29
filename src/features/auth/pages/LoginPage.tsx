import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const navigate = useNavigate();
    const setSession = useAuthStore((state) => state.setSession);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setError(null);
        try {
            const { session, error: authError } = await authService.login(data.email, data.password);

            if (authError) {
                setError(authError.message);
                return;
            }

            if (session) {
                setSession(session);
                navigate('/');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300 font-display">
            <div className="relative flex h-auto w-full flex-col group/design-root overflow-x-hidden max-w-[480px] mx-auto shadow-sm bg-white dark:bg-gray-800/50 rounded-xl">
                {/* Header Image / Brand Logo */}
                <div className="flex flex-col items-center pt-16 pb-8">
                    <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white text-4xl" data-icon="account_balance_wallet">account_balance_wallet</span>
                    </div>
                </div>

                {/* Headline & Body Text */}
                <div className="px-4">
                    <h2 className="text-[#111318] dark:text-white tracking-tight text-[32px] font-extrabold leading-tight text-center pb-2">Welcome back!</h2>
                    <p className="text-[#616e89] dark:text-gray-400 text-base font-normal leading-normal text-center pb-8">Login to manage your finances with AI insights</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Form Fields */}
                    <div className="flex flex-col gap-1 px-4">
                        {/* Email Field */}
                        <div className="flex flex-wrap items-end gap-4 py-3">
                            <label className="flex flex-col min-w-40 flex-1">
                                <p className="text-[#111318] dark:text-gray-200 text-sm font-semibold leading-normal pb-2 ml-1">Email Address</p>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#616e89]" data-icon="mail">mail</span>
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111318] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border ${errors.email ? 'border-red-500' : 'border-[#dbdee6] dark:border-gray-700'} bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-[#616e89] pl-12 pr-4 text-base font-normal leading-normal`}
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>
                                )}
                            </label>
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-wrap items-end gap-4 py-3">
                            <label className="flex flex-col min-w-40 flex-1">
                                <div className="flex justify-between items-center pb-2 px-1">
                                    <p className="text-[#111318] dark:text-gray-200 text-sm font-semibold leading-normal">Password</p>
                                    <a className="text-primary text-sm font-semibold hover:underline" href="#">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#616e89]" data-icon="lock">lock</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111318] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border ${errors.password ? 'border-red-500' : 'border-[#dbdee6] dark:border-gray-700'} bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-[#616e89] pl-12 pr-12 text-base font-normal leading-normal`}
                                        {...register('password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#616e89] hover:text-primary transition-colors focus:outline-none"
                                    >
                                        <span className="material-symbols-outlined cursor-pointer select-none" data-icon="visibility">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="px-4 pb-2">
                            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-center">
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Primary Action */}
                    <div className="px-4 pt-6 pb-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <span className="material-symbols-outlined animate-spin" data-icon="progress_activity">progress_activity</span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </div>
                </form>

                {/* Biometrics Section */}
                <div className="flex flex-col items-center py-6">
                    <div className="flex items-center gap-4 w-full px-4 mb-6">
                        <div className="h-[1px] bg-[#dbdee6] dark:bg-gray-700 flex-1"></div>
                        <span className="text-[#616e89] text-xs font-bold uppercase tracking-wider">Or secure access</span>
                        <div className="h-[1px] bg-[#dbdee6] dark:bg-gray-700 flex-1"></div>
                    </div>
                    <button className="flex flex-col items-center gap-2 group" type="button">
                        <div className="w-14 h-14 rounded-full border-2 border-primary/20 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                            <span className="material-symbols-outlined text-primary text-3xl" data-icon="fingerprint">fingerprint</span>
                        </div>
                        <span className="text-[#111318] dark:text-gray-300 text-sm font-medium">Sign in with Biometrics</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-auto pb-10 px-4 text-center">
                    <p className="text-[#616e89] text-sm font-medium">
                        Don't have an account?
                        <Link to="/contact-admin" className="text-primary font-bold hover:underline ml-1">
                            Sign Up
                        </Link>
                    </p>
                </div>

                {/* Receipt Scanning Promo (Small Card) */}
                <div className="mx-4 mb-8 p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10 flex items-center gap-4">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-primary" data-icon="receipt_long">receipt_long</span>
                    </div>
                    <div>
                        <p className="text-[#111318] dark:text-white text-sm font-bold">Smart OCR Scanning</p>
                        <p className="text-[#616e89] dark:text-gray-400 text-xs">Scan receipts instantly with AI</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
