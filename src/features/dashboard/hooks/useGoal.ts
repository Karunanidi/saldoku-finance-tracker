import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalRepository } from '@/data/repositories/goalRepository';
import { CreateGoalDTO, UpdateGoalDTO } from '@/data/models/Goal';

export const useGoals = () => {
    return useQuery({
        queryKey: ['goals'],
        queryFn: () => goalRepository.getAll(),
    });
};

export const useSaveGoal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id?: string; data: CreateGoalDTO | UpdateGoalDTO }) => {
            if (id) {
                return goalRepository.update(id, data);
            } else {
                return goalRepository.create(data as CreateGoalDTO);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['goals'] });
        },
    });
};
