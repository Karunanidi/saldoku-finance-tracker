import { useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useCreateTransaction } from '../hooks/useTransactions';
import { TRANSACTION_CATEGORIES, CreateTransactionDTO } from '@/data/models/Transaction';
import { useAuthStore } from '@/features/auth/store/authStore';

interface TransactionFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const TransactionForm = ({ onSuccess, onCancel }: TransactionFormProps) => {
    const createTransaction = useCreateTransaction();
    const { user } = useAuthStore();

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(TRANSACTION_CATEGORIES[0]);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isExpense, setIsExpense] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            setError("You must be logged in.");
            return;
        }

        if (isExpense === null) {
            setError("Please select a transaction type (Income or Expense) first!");
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            setError("Please enter a valid amount.");
            return;
        }

        if (!description.trim()) {
            setError("Please enter a description.");
            return;
        }

        // Create a Date object in local time using the selected date and current time
        const [year, month, day] = date.split('-').map(Number);
        const now = new Date();
        const transactionDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());

        const transactionData: CreateTransactionDTO = {
            amount: parseFloat(amount),
            category: category as any, // Cast to any or TransactionCategory to satisfy TS
            description: description,
            date: transactionDate.toISOString(),
            is_expense: isExpense
        };

        try {
            await createTransaction.mutateAsync(transactionData);
            // Reset form
            setAmount('');
            setDescription('');
            setIsExpense(null);
            onSuccess?.();
        } catch (err) {
            console.error(err);
            setError("Failed to save transaction.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-4">Add New Transaction</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                </div>
            )}

            <div className="flex gap-2 mb-4">
                <button
                    type="button"
                    onClick={() => { setIsExpense(true); setError(null); }}
                    className={`flex-1 py-2 rounded-xl font-medium transition-colors ${isExpense === true ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                    Expense
                </button>
                <button
                    type="button"
                    onClick={() => { setIsExpense(false); setError(null); }}
                    className={`flex-1 py-2 rounded-xl font-medium transition-colors ${isExpense === false ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                    Income
                </button>
            </div>

            <div className="space-y-4">
                <Input
                    label="Description"
                    placeholder="Lunch, Salary, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                            className="w-full h-10 rounded-xl border border-gray-300 dark:border-gray-600 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all"
                        >
                            {TRANSACTION_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-gray-500 pointer-events-none">expand_more</span>
                    </div>
                </div>

                <Input
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <div className="flex space-x-3 pt-4">
                    <Button type="submit" isLoading={createTransaction.isPending}>
                        Save Transaction
                    </Button>
                    {onCancel && (
                        <Button type="button" variant="ghost" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
};
