export interface Goal {
    id: string;
    user_id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    target_date?: string;
    category?: string;
    image_url?: string;
    created_at?: string;
}

export type CreateGoalDTO = Omit<Goal, 'id' | 'user_id' | 'created_at'> & {
    current_amount?: number;
};
export type UpdateGoalDTO = Partial<CreateGoalDTO>;
