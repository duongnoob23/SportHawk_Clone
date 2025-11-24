import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPaymentRequest,
  getPaymentRequestById,
  getPaymentRequestsWithMembers,
  updatePaymentRequest,
} from '@top/features/payments/apis/paymentRequest';
import {
  CreatePaymentRequestData,
  UpdatePaymentRequestData,
} from '@top/features/payments/types';

export const useGetPaymentRequestById = (id: string) => {
  return useQuery({
    queryKey: ['paymentRequest', id],
    queryFn: () => getPaymentRequestById(id),
    enabled: !!id,
  });
};

export const useGetPaymentRequestWithMembers = (paymentId: string) => {
  return useQuery({
    queryKey: ['paymentRequestWithMember', paymentId],
    queryFn: () => getPaymentRequestsWithMembers(paymentId),
    enabled: !!paymentId,
  });
};

export const useCreatePaymentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequestData) =>
     createPaymentRequest(data),
    onSuccess: () => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['paymentRequest'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

export const useUpdatePaymentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePaymentRequestData;
    }) => updatePaymentRequest(id, data),
    onSuccess: (updatedData, variables) => {
      // Update the cache directly with the new data
      queryClient.setQueryData(['paymentRequest', variables.id], updatedData);
      queryClient.setQueryData(
        ['paymentRequestWithMember', variables.id],
        (previous: typeof updatedData | undefined) =>
          previous ? { ...previous, ...updatedData } : updatedData
      );

      queryClient.invalidateQueries({ queryKey: ['paymentRequest'] });
      queryClient.invalidateQueries({
        queryKey: ['paymentRequestWithMember', updatedData.id],
      });
      queryClient.invalidateQueries({ queryKey: ['paymentRequestMember'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};
