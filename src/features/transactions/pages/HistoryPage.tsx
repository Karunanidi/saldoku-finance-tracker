import { useState, useMemo } from 'react';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { formatCurrency } from '@/core/utils/currency';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Transaction } from '@/data/models/Transaction';

export const HistoryPage = () => {
    const { data: transactions = [], isLoading } = useTransactions();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch =
                t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter =
                filterType === 'all' ? true :
                    filterType === 'income' ? !t.is_expense :
                        filterType === 'expense' ? t.is_expense : true;

            return matchesSearch && matchesFilter;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, searchTerm, filterType]);

    const groupedTransactions = useMemo(() => {
        const groups: { [key: string]: Transaction[] } = {};

        filteredTransactions.forEach(t => {
            const date = parseISO(t.date);
            let key = format(date, 'MMMM d');

            if (isToday(date)) key = 'Today';
            else if (isYesterday(date)) key = 'Yesterday';

            if (!groups[key]) groups[key] = [];
            groups[key].push(t);
        });

        return groups;
    }, [filteredTransactions]);

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'food': return 'restaurant';
            case 'transport': return 'directions_car';
            case 'shopping': return 'shopping_bag';
            case 'housing': return 'home';
            case 'salary': return 'account_balance_wallet';
            default: return 'receipt';
        }
    };

    const getCategoryColor = (isExpense: boolean) => {
        return isExpense ? 'bg-[#f0f1f4] dark:bg-gray-800 text-[#111318] dark:text-white' : 'bg-success/10 text-success';
    };

    return (
        <AppLayout title="Transaction History" showAddButton={true}>
            <div className="flex flex-col w-full">
                {/* Search & Filter Section - Sticky top-0 */}
                <div className="bg-white dark:bg-background-dark border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
                    <div className="px-4 py-2">
                        <label className="flex flex-col min-w-40 h-11 w-full">
                            <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-[#f0f1f4] dark:bg-gray-800">
                                <div className="text-[#616e89] flex items-center justify-center pl-4 rounded-l-xl">
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 h-full placeholder:text-[#616e89] px-4 pl-2 text-base font-normal leading-normal dark:text-white"
                                    placeholder="Search merchant or category"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="text-[#616e89] flex items-center justify-center pr-4 rounded-r-xl">
                                    <span className="material-symbols-outlined text-[20px] cursor-pointer">tune</span>
                                </div>
                            </div>
                        </label>
                    </div>
                    <div className="flex gap-3 px-4 py-3 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`flex h-9 shrink-0 items-center justify-center gap-x-1 rounded-full px-4 shadow-sm transition-colors ${filterType === 'all' ? 'bg-primary text-white' : 'bg-[#f0f1f4] dark:bg-gray-800 text-[#111318] dark:text-gray-300'}`}
                        >
                            <p className="text-sm font-semibold">All</p>
                        </button>
                        <button
                            onClick={() => setFilterType('income')}
                            className={`flex h-9 shrink-0 items-center justify-center gap-x-1 rounded-full px-4 text-[#111318] dark:text-gray-300 transition-colors ${filterType === 'income' ? 'bg-primary text-white' : 'bg-[#f0f1f4] dark:bg-gray-800'}`}
                        >
                            <p className="text-sm font-medium">Income</p>
                            {filterType !== 'income' && <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>}
                        </button>
                        <button
                            onClick={() => setFilterType('expense')}
                            className={`flex h-9 shrink-0 items-center justify-center gap-x-1 rounded-full px-4 text-[#111318] dark:text-gray-300 transition-colors ${filterType === 'expense' ? 'bg-primary text-white' : 'bg-[#f0f1f4] dark:bg-gray-800'}`}
                        >
                            <p className="text-sm font-medium">Expenses</p>
                            {filterType !== 'expense' && <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>}
                        </button>
                    </div>
                </div>

                {/* List Container */}
                <div className="flex-1 bg-white dark:bg-background-dark pb-24">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading transactions...</div>
                    ) : Object.keys(groupedTransactions).length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No transactions found.</div>
                    ) : (
                        Object.entries(groupedTransactions).map(([dateLabel, group]) => (
                            <div key={dateLabel} className="bg-white dark:bg-background-dark">
                                {/* Date Header - Sticky below Search/Filters (120px) */}
                                <div className="sticky top-[120px] bg-white dark:bg-background-dark z-20 border-b border-gray-50 dark:border-gray-800/50">
                                    <h3 className="text-[#111318] dark:text-white text-base font-bold leading-tight px-4 py-3 bg-gray-50 dark:bg-gray-800/90">{dateLabel}</h3>
                                </div>
                                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                    {group.map(t => (
                                        <div key={t.id} className="flex items-center gap-4 bg-white dark:bg-background-dark px-4 min-h-[72px] py-2 justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex items-center justify-center rounded-xl shrink-0 size-12 ${getCategoryColor(t.is_expense)}`}>
                                                    <span className="material-symbols-outlined">{getCategoryIcon(t.category)}</span>
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <p className="text-[#111318] dark:text-white text-base font-semibold leading-normal line-clamp-1">{t.description || t.category}</p>
                                                    <p className="text-[#616e89] dark:text-gray-400 text-xs font-normal leading-normal">
                                                        {format(parseISO(t.date), 'hh:mm a')} • {t.category}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                <p className={`text-base font-bold leading-normal ${t.is_expense ? 'text-red-500' : 'text-green-500'}`}>
                                                    {t.is_expense ? '-' : '+'}{formatCurrency(t.amount)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
};
