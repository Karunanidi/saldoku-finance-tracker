import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { CreateTransactionDTO } from '@/data/models/Transaction';

export const useTransactions = () => {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: () => transactionRepository.getAll(),
    });
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTransactionDTO) => transactionRepository.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => transactionRepository.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
};
