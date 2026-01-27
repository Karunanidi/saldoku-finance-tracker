import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
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
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign in to SaldoKu</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Welcome back! Please enter your details.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            {...register('email')}
                            error={errors.email?.message}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            {...register('password')}
                            error={errors.password?.message}
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" isLoading={isSubmitting}>
                        Sign In
                    </Button>

                    <p className="text-center text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};
