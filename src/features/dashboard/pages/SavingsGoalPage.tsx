import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useGoals, useSaveGoal } from '../hooks/useGoal';
import { formatCurrency } from '@/core/utils/currency';

const goalSchema = z.object({
    name: z.string().min(1, 'Goal name is required'),
    category: z.string().min(1, 'Category is required'),
    target_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be greater than 0'),
    target_date: z.string().min(1, 'Target date is required'),
});

type GoalFormInput = z.infer<typeof goalSchema>;

const CATEGORIES = ['Emergency', 'Travel', 'Tech', 'Health', 'Education', 'Other'];

export const SavingsGoalPage = () => {
    console.log('SavingsGoalPage mounting...');
    const { data: goals = [], isLoading } = useGoals();
    const { mutate: saveGoal, isPending } = useSaveGoal();
    const [selectedCategory, setSelectedCategory] = useState<string>('Emergency');

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<GoalFormInput>({
        resolver: zodResolver(goalSchema),
        defaultValues: {
            category: 'Emergency'
        }
    });

    const onSubmit = (data: GoalFormInput) => {
        saveGoal({
            data: {
                name: data.name,
                category: data.category,
                target_amount: Number(data.target_amount),
                target_date: data.target_date,
                current_amount: 0,
                // Assign a random image based on category for demo purposes
                image_url: getCategoryImage(data.category)
            }
        }, {
            onSuccess: () => {
                reset();
                setSelectedCategory('Emergency');
                setValue('category', 'Emergency');
            }
        });
    };

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setValue('category', category);
    };

    const getCategoryImage = (category: string) => {
        switch (category) {
            case 'Tech': return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPo0OUC_qoFpxZEr3uEbZNLp_fKfOjQ996pxyVHxozNytLnXdFk2kbG4C3uQisR-iqAG0LgWM_YRkqCqIosWfgY4v7bcmvk-BB-LxioFpV7BLh5p10YeupeP3JFP4a85WZiGlHiCIGXcgVuhpU-VseUC7kyTyPf05C1FYQ_S1H_Pa8eSbh4UtAikpXecHmLMPhKepaA6bd8ykXNPkmX5vNARo5YxYAUcAiVVuo-E2LckURE-Jy0m6WDKgtnWH4DSz3gBavVgxpsKIq';
            case 'Travel': return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC8tEMpPSmSNSIEZARDrsmtk5Ya-RQQVeDtQRcKheVWYCpBD3yIsnBSqZMvR7aBT1XdGm1za0taVQdflOP6uJbWkm57FhqtvI1Ze8ADqtp0URpP9_ygwzqlyLVP91k59TbM06tfwYooTPxgMTK2_nh_BR8B7ZL1Eq4aq1uLnhIPqeVSmUm0Jh05xNIlqz9-2L6CpjlyKYOMSsyH-s1WWm8VkAQcAxP0CwX7Ec5qBgaeEt-4I55f5B6F7tDQp3ghAzP2LjuC4oN5Tx7';
            default: return 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop';
        }
    };

    return (
        <AppLayout title="Savings Goals" showAddButton={false}>
            <div className="flex flex-col">
                <section className="px-4 pt-6 pb-2">
                    <h3 className="text-[#111318] dark:text-white text-xl font-extrabold leading-tight tracking-[-0.015em]">Your Progress</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">You're on track to reach your targets</p>
                </section>

                {goals.length > 0 ? (
                    <div className="flex overflow-x-auto hide-scrollbar snap-x pb-4">
                        <div className="flex items-stretch px-4 gap-4">
                            {goals.map((goal) => {
                                const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                                return (
                                    <div key={goal.id} className="snap-center flex flex-col gap-4 rounded-xl min-w-[280px] bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                                        <div
                                            className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex flex-col items-center justify-center relative overflow-hidden"
                                            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url("${goal.image_url || getCategoryImage(goal.category || 'Other')}")` }}
                                        >
                                            <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                {goal.category}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-[#111318] dark:text-white text-base font-bold leading-normal truncate max-w-[150px]">{goal.name}</p>
                                                <p className="text-primary text-sm font-bold">{progress.toFixed(0)}%</p>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full mb-2 overflow-hidden">
                                                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                            </div>
                                            <p className="text-[#616e89] dark:text-gray-400 text-sm font-normal leading-normal">
                                                {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)} saved
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : !isLoading && (
                    <div className="px-4 pb-4">
                        <div className="flex flex-col items-center justify-center rounded-2xl min-h-[160px] bg-white dark:bg-gray-800/50 p-8 border border-dashed border-gray-300 dark:border-gray-700 shadow-sm">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-primary text-3xl">savings</span>
                            </div>
                            <p className="text-gray-900 dark:text-gray-100 font-bold mb-1">No goals yet</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">Set your first savings goal below to start tracking your progress!</p>
                        </div>
                    </div>
                )}

                <section className="mt-4 px-4 pb-24">
                    <div className="flex items-center gap-2 pb-6 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                        <span className="material-symbols-outlined text-primary text-2xl">add_circle</span>
                        <h3 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Create New Goal</h3>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <div className="flex flex-col w-full">
                            <p className="text-[#111318] dark:text-gray-300 text-sm font-semibold pb-2">Goal Name</p>
                            <input
                                {...register('name')}
                                className="form-input flex w-full rounded-xl text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary border-[#dbdee6] dark:border-gray-700 bg-white dark:bg-gray-800 h-14 placeholder:text-[#616e89] px-4 text-base font-normal"
                                placeholder="e.g. Emergency Fund"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>

                        <div className="flex flex-col w-full">
                            <p className="text-[#111318] dark:text-gray-300 text-sm font-semibold pb-3">Category</p>
                            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 -mx-4 px-4">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => handleCategorySelect(cat)}
                                        className={`flex-none px-5 py-2.5 rounded-full border text-sm font-medium transition-colors ${selectedCategory === cat
                                            ? 'border-primary bg-primary text-white'
                                            : 'border-[#dbdee6] dark:border-gray-700 text-[#616e89] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col w-full">
                            <p className="text-[#111318] dark:text-gray-300 text-sm font-semibold pb-2">Target Amount</p>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111318] dark:text-white font-bold">Rp</span>
                                <input
                                    {...register('target_amount')}
                                    className="form-input flex w-full rounded-xl text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary border-[#dbdee6] dark:border-gray-700 bg-white dark:bg-gray-800 h-14 placeholder:text-[#616e89] pl-12 pr-4 text-base font-normal"
                                    placeholder="0"
                                    type="number"
                                />
                            </div>
                            {errors.target_amount && <p className="text-red-500 text-xs mt-1">{errors.target_amount.message}</p>}
                        </div>

                        <div className="flex flex-col w-full">
                            <p className="text-[#111318] dark:text-gray-300 text-sm font-semibold pb-2">Target Date</p>
                            <div className="relative">
                                <input
                                    {...register('target_date')}
                                    className="form-input flex w-full rounded-xl text-[#111318] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary border-[#dbdee6] dark:border-gray-700 bg-white dark:bg-gray-800 h-14 placeholder:text-[#616e89] px-4 text-base font-normal appearance-none"
                                    type="date"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 pointer-events-none">calendar_today</span>
                            </div>
                            {errors.target_date && <p className="text-red-500 text-xs mt-1">{errors.target_date.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-primary hover:bg-[#1d4ed8] text-white font-bold py-4 px-6 rounded-xl mt-2 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span>{isPending ? 'Saving...' : 'Set Goal'}</span>
                            <span className="material-symbols-outlined">rocket_launch</span>
                        </button>
                    </form>
                </section>
            </div>
        </AppLayout>
    );
};
