import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
    const navigate = useNavigate();
    const setSession = useAuthStore((state) => state.setSession);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setError(null);
        try {
            const { session, error: authError } = await authService.register(data.email, data.password);

            if (authError) {
                setError(authError.message);
                return;
            }

            if (session) {
                setSession(session);
                navigate('/');
            } else {
                // If email confirmation is required, session might be null.
                // For this demo, we assume auto-login or redirect to login.
                navigate('/login');
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
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Start managing your finances with SaldoKu.
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
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            {...register('confirmPassword')}
                            error={errors.confirmPassword?.message}
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" isLoading={isSubmitting}>
                        Sign Up
                    </Button>

                    <p className="text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};
