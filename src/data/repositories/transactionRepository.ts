import { supabase } from '@/core/api/supabase';
import { CreateTransactionDTO, Transaction, UpdateTransactionDTO } from '../models/Transaction';
import { startOfMonth, endOfMonth } from 'date-fns';

export const transactionRepository = {
    async getAll(): Promise<Transaction[]> {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getByMonth(date: Date): Promise<Transaction[]> {
        // Format as ISO string for comparison 
        const start = startOfMonth(date).toISOString();
        const end = endOfMonth(date).toISOString();

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .gte('date', start)
            .lte('date', end)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async create(transaction: CreateTransactionDTO): Promise<Transaction> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                ...transaction,
                user_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: UpdateTransactionDTO): Promise<Transaction> {
        const { data, error } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
