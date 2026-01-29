import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { CreateGoalDTO, Goal } from '@/data/models/Goal';

const goalSchema = z.object({
    name: z.string().min(1, 'Goal name is required'),
    target_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be greater than 0'),
});

type GoalFormInput = z.infer<typeof goalSchema>;

interface GoalFormProps {
    initialData?: Goal | null;
    onSuccess: (data: CreateGoalDTO) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const GoalForm = ({ initialData, onSuccess, onCancel, isLoading }: GoalFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<GoalFormInput>({
        resolver: zodResolver(goalSchema),
        defaultValues: {
            name: initialData?.name || '',
            target_amount: initialData?.target_amount ? String(initialData.target_amount) : '',
        },
    });

    const onSubmit = (data: GoalFormInput) => {
        onSuccess({
            name: data.name,
            target_amount: Number(data.target_amount),
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {initialData ? 'Edit Savings Goal' : 'Set Savings Goal'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Goal Name"
                    placeholder="e.g. House Downpayment"
                    {...register('name')}
                    error={errors.name?.message}
                />
                <Input
                    label="Target Amount"
                    type="number"
                    placeholder="0"
                    {...register('target_amount')}
                    error={errors.target_amount?.message}
                />
                <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Save Goal
                    </Button>
                </div>
            </form>
        </div>
    );
};
