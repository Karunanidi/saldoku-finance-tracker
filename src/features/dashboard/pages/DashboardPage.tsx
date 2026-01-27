import { useState } from 'react';
// import { useAuthStore } from '@/features/auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { TransactionList } from '@/features/transactions/components/TransactionList';
import { SpendingInsights } from '@/features/analytics/components/SpendingInsights';
import { TransactionForm } from '@/features/transactions/components/TransactionForm';
import { formatCurrency } from '@/core/utils/currency';
import { AppLayout } from '@/components/Layout/AppLayout';

export const DashboardPage = () => {
    // const { user } = useAuthStore(); // Keep user for any dashboard-specific logic if needed
    const navigate = useNavigate();
    const { data: transactions = [], isLoading } = useTransactions();
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Calculate Summary
    const totalBalance = transactions.reduce((acc, curr) => curr.is_expense ? acc - curr.amount : acc + curr.amount, 0);
    const totalIncome = transactions.filter(t => !t.is_expense).reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.is_expense).reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <AppLayout title="Dashboard" showAddButton={true}>
            <div className="p-4 @container">
                {/* Form Toggle Area */}
                {isFormOpen && (
                    <div className="mb-6">
                        <TransactionForm onSuccess={() => setIsFormOpen(false)} onCancel={() => setIsFormOpen(false)} />
                    </div>
                )}

                <div className="flex justify-end mb-4 gap-2">
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm text-[#111318] dark:text-white text-primary"
                    >
                        <span className="material-symbols-outlined">add</span>
                    </button>
                    <button
                        onClick={() => navigate('/history')}
                        className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm text-[#111318] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="material-symbols-outlined">receipt_long</span>
                    </button>
                </div>

                {/* Balance Card */}
                <div className="flex flex-col items-stretch justify-start rounded-2xl shadow-lg bg-gradient-to-br from-[#2463eb] to-[#1d4ed8] text-white overflow-hidden mb-6">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-blue-100 text-sm font-medium">Total Balance</p>
                            <span className="material-symbols-outlined text-blue-200">account_balance_wallet</span>
                        </div>
                        <p className="text-white text-3xl font-extrabold leading-tight tracking-tight mb-6">
                            {formatCurrency(totalBalance)}
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-blue-200 text-xs font-medium">Monthly Income</p>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs text-green-300">arrow_upward</span>
                                    <p className="text-white text-sm font-bold">+{formatCurrency(totalIncome)}</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/20"></div>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-blue-200 text-xs font-medium">Monthly Expenses</p>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs text-red-300">arrow_downward</span>
                                    <p className="text-white text-sm font-bold">-{formatCurrency(totalExpense)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 px-6 py-3 flex justify-between items-center">
                        <p className="text-xs text-blue-50 font-medium">Savings Goal: House Downpayment</p>
                        <p className="text-xs text-white font-bold">65%</p>
                    </div>
                </div>

                {/* AI Section Integration */}
                <SpendingInsights transactions={transactions} income={totalIncome} />

            </div>

            {/* Transactions */}
            <div className="px-4 pt-6 pb-20">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[#111318] dark:text-white text-base font-bold leading-tight tracking-[-0.015em]">Recent Transactions</h3>
                    <button onClick={() => navigate('/analytics')} className="text-primary text-xs font-bold">View All</button>
                </div>

                <TransactionList transactions={transactions} isLoading={isLoading} />
            </div>
            <div className="h-8 bg-background-light dark:bg-background-dark"></div>
        </AppLayout>
    );
};
