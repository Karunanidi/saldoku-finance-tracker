export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    category: string;
    date: string; // ISO string
    description?: string;
    is_expense: boolean;
    receipt_url?: string;
    created_at?: string;
}

export type CreateTransactionDTO = Omit<Transaction, 'id' | 'user_id' | 'created_at'>;
export type UpdateTransactionDTO = Partial<CreateTransactionDTO>;

export const TRANSACTION_CATEGORIES = [
    'Food',
    'Transport',
    'Shopping',
    'Housing',
    'Utilities',
    'Health',
    'Entertainment',
    'Salary',
    'Business',
    'Other'
] as const;

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number];
