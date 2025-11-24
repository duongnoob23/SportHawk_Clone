import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationType } from '@top/types/notificationTypes';
import { getInsertNotificationTemplate } from '../api/notifications';
import {
  EventCreateNotificationType,
  EventDetailsResponseNotificationType,
  EventEditCancelNotificationType,
  EventEditSelectSquadNotificationType,
  EventEditUpdateNotificationType,
  MemberApprovedtNotificationType,
  MemberInteresttNotificationType,
  MemberRemovedtNotificationType,
  PaymentCancelNotificationType,
  PaymentCreateNotificationType,
  PaymentFailNotificationType,
  PaymentReceivedNotificatioType,
  PaymentSuccessNotificationType,
  PaymentUpdateNotificationType,
} from '../types/notification';

// MANUAL REMINDER NOTIFICATION IN EVENT DETAILS

/////////////////
///   EVENT   ///
/////////////////

export const useInsertNotificationTemplate = () => {
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
      relatedEntityType: string;
      relatedEntityId: string;
    }) => {
      const payload = {
        userId,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId,
      };

      return getInsertNotificationTemplate(
        userId,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// SEND REMINDER WHEN CREATE EVENT -> MEMBER INVITED
export const useEventCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EventCreateNotificationType) => {
      const {
        eventDate,
        eventType,
        eventTime,
        eventName,
        eventId,
        userId,
        eventTitle,
      } = payload;

      const variables = {
        eventType,
        eventName,
        eventDate,
        eventTime,
        eventId,
        eventTitle,
      };

      const trigger = NotificationType.EVENT_CREATE;
      const relatedEntityId = eventId;
      const relatedEntityType = 'event_requests';
      return getInsertNotificationTemplate(
        userId,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });
};

// SEND NOTI TO REMINDER MEMBER
export const useEventReminderNotification = () => {
  const queryClient = useQueryClient();
  const createNotification = useInsertNotificationTemplate();

  return useMutation({
    mutationFn: async ({
      userId,
      eventId,
      eventName,
      eventTime,
      eventTitle,
    }: {
      userId: string;
      eventId: string;
      eventName: string;
      eventTime: string;
      eventTitle: string;
    }) => {
      const variables = {
        eventName,
        eventId,
        eventTime,
        eventTitle,
      };
      return createNotification.mutateAsync({
        userId,
        trigger: NotificationType.EVENT_REMINDER,
        variables,
        relatedEntityType: 'event_requests',
        relatedEntityId: eventId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// SEND When a squad has been selected by the event leader.
export const useEventEditSelectSquadNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventEditSelectSquadNotificationType) => {
      const { userId, eventId, eventName, eventDate, eventTitle } = payload;
      const variables = {
        eventId,
        eventName,
        eventDate,
        eventTitle,
      };
      const trigger = NotificationType.EVENT_SQUADS;
      const relatedEntityType = 'event_requests';
      const relatedEntityId = eventId;
      return getInsertNotificationTemplate(
        userId,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// SEND WHEN TEAM MEMBERS RESPONSE
export const useEventDetailsResponseNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EventDetailsResponseNotificationType) => {
      const {
        userId,
        playerName,
        availabilityStatus,
        eventName,
        eventDate,
        eventId,
        eventTitle,
      } = payload;
      const variables = {
        playerName,
        availabilityStatus,
        eventName,
        eventDate,
        eventId,
        eventTitle,
      };
      const trigger = NotificationType.EVENT_RESPONSE;
      const relatedEntityType = 'event_requests';
      const relatedEntityId = eventId;
      return getInsertNotificationTemplate(
        userId,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// SEND WHEN UPDATE EVENT, NOTI FOR USER INVITED
export const useEventEditUpdateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventEditUpdateNotificationType) => {
      const {
        userId,
        eventName,
        updateReason,
        eventDate,
        eventTime,
        eventId,
        eventTitle,
      } = payload;
      const variables = {
        updateReason,
        eventTime,
        eventName,
        eventDate,
        eventId,
        eventTitle,
      };
      const trigger = NotificationType.EVENT_UPDATED;
      const relatedEntityType = 'event_requests';
      const relatedEntityId = eventId;
      return getInsertNotificationTemplate(
        userId!,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });
};

// SEND NOTI WHEN CANCEL EVENT
export const useEventEditCancelNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventEditCancelNotificationType) => {
      const {
        userId,
        eventName,
        eventDate,
        cancellationReason,
        eventId,
        eventTitle,
      } = payload;
      const variables = {
        eventName,
        eventDate,
        cancellationReason,
        eventId,
        eventTitle,
      };
      const trigger = NotificationType.EVENT_CANCEL;
      const relatedEntityType = 'event_requests';
      const relatedEntityId = eventId;
      return getInsertNotificationTemplate(
        userId!,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });
};
////////////////
//   PAYMENT  //
////////////////

// SEND NOTI WHEN PAYMENT REQUEST CREATE
export const usePaymentCreateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentCreateNotificationType) => {
      const {
        userId,
        amount,
        description,
        daysOverdue,
        paymentId,
        paymentTitle,
        clubName,
      } = payload;
      const variables = {
        amount: (amount / 100).toFixed(2),
        description,
        daysOverdue,
        daysPlural: daysOverdue > 1 ? 's' : '',
        paymentId: paymentId,
        paymentTitle,
        clubName,
      };
      const trigger = NotificationType.PAYMENT_REQUESTED;
      const relatedEntityType = 'payment_requests';
      const relatedEntityId = paymentId;
      return getInsertNotificationTemplate(
        userId!,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });
};

// SEND NOTI WHEN PAYMENT UPDATE
export const usePaymentUpdateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentUpdateNotificationType) => {
      const {
        userId,
        amount,
        description,
        paymentTitle,
        paymentId,
        updateReason,
      } = payload;
      const variables = {
        amount: (amount / 100).toFixed(2),
        description,
        paymentId: paymentId,
        paymentTitle,
        updateReason,
      };
      const trigger = NotificationType.PAYMENT_UPDATED;
      const relatedEntityType = 'payment_requests';
      const relatedEntityId = paymentId;
      return getInsertNotificationTemplate(
        userId!,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });
};

// SEND NOTI WHEN PAYMENT FAIL
export const usePaymentFailNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentFailNotificationType) => {
      const { userId, amount, description, paymentId, reason, paymentTitle } =
        payload;
      const variables = {
        amount: (amount / 100).toFixed(2),
        description,
        paymentId: paymentId,
        reason,
        paymentTitle,
      };
      const trigger = NotificationType.PAYMENT_FAILED;
      const relatedEntityType = 'payment_requests';
      const relatedEntityId = paymentId;
      return getInsertNotificationTemplate(
        userId!,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });
};

// SEND NOTI WHEN PAYMENT SUCCESS FOR MEMBER
export const usePaymentSuccessNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentSuccessNotificationType) => {
      const { userId, amount, description, paymentId, paymentTitle } = payload;
      const variables = {
        amount: (amount / 100).toFixed(2),
        description,
        paymentTitle,
      };
      const trigger = NotificationType.PAYMENT_PAID;
      const relatedEntityType = 'payment_requests';
      const relatedEntityId = paymentId;
      return getInsertNotificationTemplate(
        userId!,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });
};

// SEND NOTI WHEN PAYMENT SUCCESS FOR LEADER
export const usePaymentReceivedNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentReceivedNotificatioType) => {
      const { userId, amount, paymentTitle, paymentId, memberFullName } =
        payload;
      const variables = {
        amount: (amount / 100).toFixed(2),
        memberFullName,
        paymentTitle,
      };
      const trigger = NotificationType.PAYMENT_RECEIVED;
      const relatedEntityType = 'payment_requests';
      const relatedEntityId = paymentId;
      return getInsertNotificationTemplate(
        userId!,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });
};

// SEND NOTI WHEN PAYMENT CANCEL
export const usePaymentCancelNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentCancelNotificationType) => {
      const { userId, clubName, paymentTitle, paymentId } = payload;
      const variables = {
        paymentTitle,
        clubName,
        paymentId,
      };
      const trigger = NotificationType.PAYMENT_CANCEL;
      const relatedEntityType = 'payment_requests';
      const relatedEntityId = paymentId;
      return getInsertNotificationTemplate(
        userId!,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });
};

////////////////
//   MEMBER  //
////////////////

// SEND WHEN ADMIN APPROVED MEMBER
export const useMemberApprovedtNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MemberApprovedtNotificationType) => {
      const { userId, clubName, teamName } = payload;
      const variables = {
        teamName,
        clubName,
      };
      const trigger = NotificationType.MEMBER_APPROVE;
      const relatedEntityType = 'member_requests';
      const relatedEntityId = userId;
      return getInsertNotificationTemplate(
        userId!,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });
};

// SEND WHEN MEMBER INTEREST
export const useMemberInteresttNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MemberInteresttNotificationType) => {
      const { userId, clubName, teamName, newMemberName } = payload;
      const variables = {
        teamName,
        clubName,
        newMemberName,
      };
      const trigger = NotificationType.MEMBER_INTEREST;
      const relatedEntityType = 'member_requests';
      const relatedEntityId = userId;
      return getInsertNotificationTemplate(
        userId!,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });
};

// SEND WHEN MEMBER REMOVED
export const useMemberRemovedtNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MemberRemovedtNotificationType) => {
      const { userId, clubName, teamName } = payload;
      const variables = {
        teamName,
        clubName,
      };
      const trigger = NotificationType.MEMBER_REMOVE;
      const relatedEntityType = 'member_requests';
      const relatedEntityId = userId;
      return getInsertNotificationTemplate(
        userId!,
        trigger,
        variables,
        relatedEntityType,
        relatedEntityId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification'] });
    },
  });
};
