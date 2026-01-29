import { supabase } from '@/core/api/supabase';
import { CreateGoalDTO, Goal, UpdateGoalDTO } from '../models/Goal';

export const goalRepository = {
    async getAll(): Promise<Goal[]> {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async create(goal: CreateGoalDTO): Promise<Goal> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('goals')
            .insert({
                ...goal,
                user_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: UpdateGoalDTO): Promise<Goal> {
        const { data, error } = await supabase
            .from('goals')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
