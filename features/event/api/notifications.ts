import {
  getNotificationTemplate,
  processNotificationTemplate,
} from '@top/constants/notificationTemplateApi';
import { supabase } from '@top/lib/supabase';
import { logger } from '@top/lib/utils/logger';
import {
  DeliveryMethod,
  DeliveryStatus,
  NotificationRecord,
} from '@top/types/notificationTypes';
import { GetNotificationType } from '../types/notification';

export const getInsertNotificationTemplate = async (
  userId: string,
  trigger: string,
  variables: Record<string, any>,
  relatedEntityType?: string,
  relatedEntityId?: string
) => {
  try {
    const template = await getNotificationTemplate(trigger);
    if (!template) {
      logger.error(`Template not found for trigger: ${trigger}`);
      return null;
    }

    const processedNotification = processNotificationTemplate(
      template,
      variables
    );

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        notification_type: trigger,
        title: processedNotification.title,
        message: processedNotification.message,
        priority: processedNotification.priority,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId,
        data: processedNotification.data,
        delivery_method: DeliveryMethod.PUSH,
        delivery_status: DeliveryStatus.PENDING,
        is_read: false,
      })
      .select(
        `
            id,
            userId:user_id,
            notificationType:notification_type,
            title,
            message,
            data,
            relatedEntityType:related_entity_type,
            relatedEntityId:related_entity_id,
            priority,
            deliveryMethod:delivery_method,
            deliveryStatus:delivery_status,
            deliveryAttempts:delivery_attempts,
            lastDeliveryAttempt:last_delivery_attempt,
            isRead:is_read,
            readAt:read_at,
            createdAt:created_at,
            expiresAt:expires_at
            `
      )
      .single<NotificationRecord>();
    if (error) {
      logger.error('Failed to create notification:', error);
      return null;
    }

    logger.log('Notification created successfully:', {
      notificationId: data.id,
      userId,
      trigger,
    });

    return processedNotification;
  } catch (error) {
    logger.error(
      'Error creating notification from getInsertNotificationTemplate:',
      error
    );
    return null;
  }
};

export const getEventEditSelectSquadNotification = async (
  payload: GetNotificationType
) => {
  const { userId, trigger, variables, relatedEntityId, relatedEntityType } =
    payload;

  const template = await getNotificationTemplate(trigger);
  if (!template) {
    logger.error(`Template not found for trigger: ${trigger}`);
    return null;
  }

  const processedNotification = processNotificationTemplate(
    template,
    variables
  );

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      notification_type: trigger,
      title: processedNotification.title,
      message: processedNotification.message,
      priority: processedNotification.priority,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      data: processedNotification.data,
      delivery_method: DeliveryMethod.PUSH,
      delivery_status: DeliveryStatus.PENDING,
      is_read: false,
    })
    .select(
      `
            id,
            userId:user_id,
            notificationType:notification_type,
            title,
            message,
            data,
            relatedEntityType:related_entity_type,
            relatedEntityId:related_entity_id,
            priority,
            deliveryMethod:delivery_method,
            deliveryStatus:delivery_status,
            deliveryAttempts:delivery_attempts,
            lastDeliveryAttempt:last_delivery_attempt,
            isRead:is_read,
            readAt:read_at,
            createdAt:created_at,
            expiresAt:expires_at
            `
    )
    .single<NotificationRecord>();
  if (error) {
    logger.error('Failed to create notification:', error);
    return null;
  }

  logger.log('Notification created successfully:', {
    notificationId: data.id,
    userId,
    trigger,
  });

  return processedNotification;
};
