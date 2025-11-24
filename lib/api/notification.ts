import { supabase } from '@lib/supabase';
import { logger } from '@lib/utils/logger';
import {
  DeliveryMethod,
  DeliveryStatus,
  NotificationPriority,
  NotificationRecord,
  NotificationTemplate,
  ProcessedNotification,
} from '@typ/notificationTypes';

/**
 * Fetches a notification template by trigger with type safety
 */
export async function getNotificationTemplate(
  trigger: string
): Promise<NotificationTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('notification_templates')
      .select(
        `
        id,
        type,
        trigger,
        title,
        body,
        variables,
        actions,
        priority,
        category,
        isActive:is_active,
        createdAt:created_at,
        updatedAt:updated_at
      `
      )
      .eq('trigger', trigger)
      .eq('is_active', true)
      .single<NotificationTemplate>();

    if (error) {
      logger.error('Failed to fetch notification template:', error);
      return null;
    }

    return data;
  } catch (err) {
    logger.error('Error fetching notification template:', err);
    return null;
  }
}

/**
 * Processes a notification template with variables
 */
export function processNotificationTemplate(
  template: NotificationTemplate,
  variables: Record<string, any>
): ProcessedNotification {
  let title = template.title;
  let body = template.body;

  // Replace variables in title and body
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    const stringValue = String(value || '');

    title = title.replace(new RegExp(placeholder, 'g'), stringValue);
    body = body.replace(new RegExp(placeholder, 'g'), stringValue);
  });

  // Process actions with variable substitution
  const processedActions = template.actions.map(action => {
    if (typeof action === 'object' && action.deepLink) {
      let deepLink = action.deepLink;
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        const stringValue = String(value || '');
        deepLink = deepLink.replace(new RegExp(placeholder, 'g'), stringValue);
      });
      return { ...action, deepLink };
    }
    return action;
  });

  return {
    title,
    message: body,
    priority: template.priority,
    data: {
      actions: processedActions,
      category: template.category,
      type: template.type,
    },
  };
}

/**
 * Creates a notification using a template with type safety
 */
export async function getInsertNotificationFromTemplate(
  userId: string,
  trigger: string,
  variables: Record<string, any>,
  relatedEntityType?: string,
  relatedEntityId?: string
): Promise<ProcessedNotification | null> {
  try {
    // Fetch the template
    const template = await getNotificationTemplate(trigger);
    if (!template) {
      logger.error(`Template not found for trigger: ${trigger}`);
      return null;
    }
    // Process the template with variables
    const processedNotification = processNotificationTemplate(
      template,
      variables
    );
    // Insert into notifications table with camelCase aliases
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
  } catch (err) {
    logger.error('Error creating notification from template:', err);
    return null;
  }
}

/**
 * Creates a notification directly with type safety
 */
export async function getInsertNotification(
  // input: getInsertNotificationInput
  input: any
): Promise<NotificationRecord> {
  const payload = {
    user_id: input.userId,
    title: input.title,
    message: input.message,
    notification_type: input.notificationType,
    data: input.data ?? {},
    related_entity_type: input.relatedEntityType ?? null,
    related_entity_id: input.relatedEntityId ?? null,
    priority: input.priority ?? NotificationPriority.NORMAL,
    is_read: false,
    read_at: null,
    delivery_method: input.deliveryMethod ?? DeliveryMethod.IN_APP,
    delivery_status: input.deliveryStatus ?? DeliveryStatus.PENDING,
    delivery_attempts: 0,
    last_delivery_attempt: null,
    expires_at: input.expiresAt ?? null,
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(payload)
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

  if (error) throw error;
  return data;
}

/**
 * Gets notifications for a user with type safety
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 50
): Promise<NotificationRecord[]> {
  const { data, error } = await supabase
    .from('notifications')
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId);

  if (error) throw error;
}
