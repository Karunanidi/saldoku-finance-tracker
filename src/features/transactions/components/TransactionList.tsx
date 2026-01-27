import { Transaction } from '@/data/models/Transaction';
import { format } from 'date-fns';
import { useDeleteTransaction } from '../hooks/useTransactions';
import { formatCurrency } from '@/core/utils/currency';

interface TransactionListProps {
    transactions: Transaction[];
    isLoading: boolean;
}

export const TransactionList = ({ transactions, isLoading }: TransactionListProps) => {
    const deleteMutation = useDeleteTransaction();

    if (isLoading) {
        return <div className="p-4 text-center text-sm text-gray-500">Loading...</div>;
    }

    if (transactions.length === 0) {
        return <div className="p-4 text-center text-sm text-gray-500">No recent transactions</div>;
    }

    return (
        <div className="flex flex-col gap-3">
            {transactions.map((transaction) => {
                // Simple mapping for icons based on category (can be expanded)
                let icon = 'paid';
                let colorClass = 'bg-gray-100 text-gray-600';

                if (transaction.category === 'Food') {
                    icon = 'restaurant';
                    colorClass = 'bg-orange-100 text-orange-600';
                } else if (transaction.category === 'Shopping') {
                    icon = 'shopping_bag';
                    colorClass = 'bg-blue-100 text-blue-600';
                } else if (transaction.category === 'Transport') {
                    icon = 'directions_car';
                    colorClass = 'bg-purple-100 text-purple-600';
                }

                return (
                    <div key={transaction.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-transparent hover:border-primary/20 transition-all group">
                        <div className={`size-10 flex items-center justify-center rounded-full ${colorClass} dark:bg-opacity-20`}>
                            <span className="material-symbols-outlined">{icon}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[#111318] dark:text-white text-sm font-bold">{transaction.description || transaction.category}</p>
                            <p className="text-[#616e89] dark:text-gray-400 text-xs">
                                {format(new Date(transaction.date), 'MMM d, h:mm a')} • {transaction.category}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-bold ${transaction.is_expense ? 'text-[#111318] dark:text-white' : 'text-green-600'}`}>
                                {transaction.is_expense ? '-' : '+'}{formatCurrency(transaction.amount)}
                            </p>
                            {/* Delete button (hidden by default, shown on hover/group) - Or just small icon */}
                            <button
                                onClick={() => deleteMutation.mutate(transaction.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-red-500 font-bold uppercase ml-2"
                            >
                                DELETE
                            </button>
                            {/* Placeholder for OCR tag if we had it */}
                            {/* <p className="text-[10px] text-green-600 font-bold uppercase">OCR Scanned</p> */}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
