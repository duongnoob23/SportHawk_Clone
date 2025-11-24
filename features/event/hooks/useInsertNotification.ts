import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { getInsertNotification } from '@top/lib/api/notification';
import { logger } from '@top/lib/utils/logger';
import type { getInsertNotificationInput, NotificationType } from '../types';

export function useInsertNotification(
  onSuccess?: (data: Notification) => void,
  onError?: (error: unknown) => void
): UseMutationResult<NotificationType, unknown, getInsertNotificationInput> {
  return useMutation<NotificationType, unknown, getInsertNotificationInput>({
    mutationFn: () => getInsertNotification(),
    onSuccess: data => {
      logger.log('✅ Notification created:', data);
      if (onSuccess) onSuccess(data);
    },
    onError: error => {
      logger.error('❌ Failed to create notification:', error);
      if (onError) onError(error);
    },
  });
}
