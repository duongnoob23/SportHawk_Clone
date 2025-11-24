import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPaymentRequestMembers,
  CreatePaymentRequestMembersData,
  getPaymentRequestMemberByPaymentAndUser,
  PaymentStatusType,
  UpdatePaymentRequestData,
  updatePaymentRequestMember,
  UpdatePaymentRequestMemberData,
  updatePaymentRequestMembers,
  updatePaymentRequestMembersByPaymentId,
  UpdatePaymentRequestMembersData,
  updatePaymentRequestMemberStatus,
} from '@top/features/payments';

export const useGetPaymentRequestMember = (
  paymentRequestId: string,
  userId: string
) => {
  return useQuery({
    queryKey: ['paymentRequestMember', paymentRequestId, userId],
    queryFn: () =>
      getPaymentRequestMemberByPaymentAndUser(paymentRequestId, userId),
    enabled: !!paymentRequestId && !!userId,
  });
};

export const useCreatePaymentRequestMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequestMembersData) =>
      createPaymentRequestMembers(data),
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['paymentRequestMember'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequest'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequestWithMember'] });
    },
  });
};
export const useUpdatePaymentRequestMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      dataId: UpdatePaymentRequestMembersData,
      data: UpdatePaymentRequestData
    ) => updatePaymentRequestMembers(dataId, data),
    onSuccess: (data, variables) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['paymentRequestMember'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequest'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequestWithMember'] });
    },
  });
};

export const useUpdatePaymentRequestMemberStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentRequestMemberId,
      status,
    }: {
      paymentRequestMemberId: string;
      status: PaymentStatusType;
    }) => updatePaymentRequestMemberStatus(paymentRequestMemberId, status),
    onSuccess: (_, variables) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['paymentRequestMember'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequest'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequestWithMember'] });
      // Invalidate team payment requests to update TabPayment component
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

export const useUpdatePaymentRequestMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePaymentRequestMemberData;
    }) => updatePaymentRequestMember(id, data),
    onSuccess: (_, variables) => {
      // Invalidate related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['paymentRequestMember'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequest'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequestWithMember'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

export const useUpdatePaymentRequestMembersByPaymentId = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentRequestId,
      data,
    }: {
      paymentRequestId: string;
      data: Partial<UpdatePaymentRequestMemberData>;
    }) => updatePaymentRequestMembersByPaymentId(paymentRequestId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['paymentRequestMember'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequest'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequestWithMember'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};
