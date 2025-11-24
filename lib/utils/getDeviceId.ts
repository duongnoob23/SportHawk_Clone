import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import { logger } from '@lib/utils/logger';

const SECURE_STORE_KEY = 'sporthawk_device_id';

async function getPersistedDeviceId(): Promise<string | null> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (!isAvailable) {
      logger.warn('getPersistedDeviceId: SecureStore not available');
      return null;
    }

    return await SecureStore.getItemAsync(SECURE_STORE_KEY);
  } catch (error) {
    logger.error(
      'getPersistedDeviceId: Failed to retrieve device ID from SecureStore',
      error
    );
    return null;
  }
}

async function persistDeviceId(id: string): Promise<void> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (!isAvailable) {
      logger.warn(
        'persistDeviceId: SecureStore not available, cannot persist device ID'
      );
      return;
    }

    await SecureStore.setItemAsync(SECURE_STORE_KEY, id, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    logger.log('persistDeviceId: Successfully persisted device ID');
  } catch (error) {
    logger.error(
      'persistDeviceId: Failed to persist device ID to SecureStore',
      error
    );
  }
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getStableDeviceId(): Promise<string> {
  const existing = await getPersistedDeviceId();
  if (existing) return existing;

  let candidate: string | null = null;

  try {
    candidate = Application.getAndroidId();
    if (candidate) {
      logger.log('getStableDeviceId: Retrieved Android ID');
    }
  } catch (error) {
    logger.warn('getStableDeviceId: Failed to get Android ID', error);
  }

  if (!candidate) {
    try {
      candidate = await Application.getIosIdForVendorAsync();
      if (candidate) {
        logger.log('getStableDeviceId: Retrieved iOS ID for Vendor');
      }
    } catch (error) {
      logger.warn('getStableDeviceId: Failed to get iOS ID for Vendor', error);
    }
  }

  if (!candidate) {
    candidate = generateUuid();
    logger.log('getStableDeviceId: Generated fallback UUID');
  }

  await persistDeviceId(candidate);
  logger.log(
    'getStableDeviceId: Returning device ID:',
    candidate.substring(0, 8) + '...'
  );
  return candidate;
}
