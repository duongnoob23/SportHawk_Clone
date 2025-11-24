import { supabase } from '@lib/supabase';
import { logger } from '@lib/utils/logger';
import {
  NotificationTemplate,
  ProcessedNotification,
  NotificationAction,
} from '@typ/notificationTypes';

/**
 * Fetches a notification template by trigger
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
      .single();

    if (error) {
      logger.error('Failed to fetch notification template:', error);
      return null;
    }

    return data as NotificationTemplate;
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
  const processedActions: NotificationAction[] = template.actions.map(
    action => {
      if (typeof action === 'object' && action.deepLink) {
        let deepLink = action.deepLink;
        Object.entries(variables).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          const stringValue = String(value || '');
          deepLink = deepLink.replace(
            new RegExp(placeholder, 'g'),
            stringValue
          );
        });
        return { ...action, deepLink };
      }
      return action;
    }
  );

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
