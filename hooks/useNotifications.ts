import { useUser } from '@hks/useUser';
import {
  getInsertNotification,
  getInsertNotificationFromTemplate,
  getUserNotifications,
  markNotificationAsRead,
} from '@lib/api/notification';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getInsertNotificationInput,
  NotificationType,
} from '@typ/notificationTypes';

/**
 * Hook to get user notifications
 */
export const useGetUserNotifications = (limit: number = 50) => {
  const { user } = useUser();

  return useQuery({
    queryKey: ['notifications', user?.id, limit],
    queryFn: () => getUserNotifications(user?.id || '', limit),
    enabled: !!user?.id,
  });
};

/**
 * Hook to create a notification
 */
export const useInsertNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: getInsertNotificationInput) =>
      getInsertNotification(input),
    onSuccess: () => {
      // Invalidate notifications query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

/**
 * Hook to create notification from template
 */
export const useInsertNotificationFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      trigger,
      variables,
      relatedEntityType,
      relatedEntityId,
    }: {
      userId: string;
      trigger: string;
      variables: Record<string, any>;
      relatedEntityType?: string;
      relatedEntityId?: string;
    }) => {
      return getInsertNotificationFromTemplate(
        userId,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

/**
 * Hook to mark notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onSuccess: () => {
      // Invalidate notifications query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

/**
 * Hook for payment reminder notifications
 */
export const usePaymentReminderNotification = () => {
  const queryClient = useQueryClient();
  const createFromTemplate = useInsertNotificationFromTemplate();

  return useMutation({
    mutationFn: async ({
      userId,
      paymentRequestId,
      amount,
      description,
      daysUntilDue,
      paymentTitle,
    }: {
      userId: string;
      paymentRequestId: string;
      amount: number;
      description: string;
      daysUntilDue: number;
      paymentTitle:string;
    }) => {
      const variables = {
        amount: (amount / 100).toFixed(2),
        description,
        daysUntilDue,
        daysPlural: daysUntilDue === 1 ? '' : 's',
        paymentId: paymentRequestId,
        paymentTitle,
      };

      return createFromTemplate.mutateAsync({
        userId,
        trigger: NotificationType.PAYMENT_REMINDER,
        variables,
        relatedEntityType: 'payment_requests',
        relatedEntityId: paymentRequestId,
      });
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

/**
 * Hook for event notification
 */
export const useEventNotification = () => {
  const createFromTemplate = useInsertNotificationFromTemplate();

  const sendEventNotification = async (
    userId: string,
    eventId: string,
    eventName: string,
    eventDate: string,
    eventTime: string,
    notificationType: NotificationType
  ) => {
    const variables = {
      eventName,
      eventDate,
      eventTime,
      eventId,
    };

    return createFromTemplate.mutateAsync({
      userId,
      trigger: notificationType,
      variables,
      relatedEntityType: 'events',
      relatedEntityId: eventId,
    });
  };

  return {
    sendEventNotification,
    isLoading: createFromTemplate.isPending,
    error: createFromTemplate.error,
  };
};

/**
 * Hook for member notification
 */
export const useMemberNotification = () => {
  const createFromTemplate = useInsertNotificationFromTemplate();

  const sendMemberNotification = async (
    userId: string,
    teamId: string,
    teamName: string,
    notificationType: NotificationType
  ) => {
    const variables = {
      teamName,
      teamId,
    };

    return createFromTemplate.mutateAsync({
      userId,
      trigger: notificationType,
      variables,
      relatedEntityType: 'teams',
      relatedEntityId: teamId,
    });
  };

  return {
    sendMemberNotification,
    isLoading: createFromTemplate.isPending,
    error: createFromTemplate.error,
  };
};
