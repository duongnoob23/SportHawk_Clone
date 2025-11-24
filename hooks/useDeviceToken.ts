import { supabase } from '@lib/supabase';
import { getStableDeviceId } from '@lib/utils/getDeviceId';
import { logger } from '@lib/utils/logger';
import messaging from '@react-native-firebase/messaging';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

// Request user permission for notifications
export async function requestUserPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      // Android 13+ requires runtime POST_NOTIFICATIONS permission
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } else {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
      return enabled;
    }
  } catch (error) {
    console.log('Authorization error:', error);
    return false;
  }
}

export function useDeviceToken() {
  const registerDeviceToken = useCallback(async () => {
    try {
      // Only real devices support push
      if (!Device.isDevice) {
        logger.log(
          'registerDeviceToken: Not a real device, skipping push registration'
        );
        return;
      }

      const { data: auth } = await supabase.auth.getUser();
      const currentUser = auth.user;
      if (!currentUser) {
        logger.log('registerDeviceToken: No authenticated user, skipping');
        return;
      }

      // Request Firebase messaging permissions
      const hasPermission = await requestUserPermission();
      if (!hasPermission) {
        logger.log(
          'registerDeviceToken: Firebase messaging permission not granted'
        );
        return;
      }

      // Get FCM token using react-native-firebase
      const fcmToken = await messaging().getToken();
      console.log('FCM Token:', fcmToken);
      if (!fcmToken) {
        logger.warn('registerDeviceToken: No FCM token returned');
        return;
      }

      const deviceId = await getStableDeviceId();
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const nowIso = new Date().toISOString();

      // Upsert into device_tokens (unique by user_id, device_id)
      const { error } = await supabase.from('device_tokens').upsert(
        {
          user_id: currentUser.id,
          token: fcmToken,
          platform,
          device_id: deviceId,
          app_version:
            Application.nativeApplicationVersion ||
            Application.nativeBuildVersion,
          is_active: true,
          last_used: nowIso,
          updated_at: nowIso,
        },
        { onConflict: 'user_id,device_id' }
      );

      if (error) {
        logger.error('registerDeviceToken: Upsert error', error);
        return;
      }

      logger.log('registerDeviceToken: Registered device token successfully');
    } catch (err) {
      logger.error('registerDeviceToken: Unexpected error', err);
    }
  }, []);

  const deactivateDeviceToken = useCallback(async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const currentUser = auth.user;
      if (!currentUser) return;

      const deviceId = await getStableDeviceId();
      const nowIso = new Date().toISOString();

      const { error } = await supabase
        .from('device_tokens')
        .update({ is_active: false, updated_at: nowIso })
        .eq('user_id', currentUser.id)
        .eq('device_id', deviceId);

      if (error) {
        logger.error('deactivateDeviceToken: Update error', error);
        return;
      }
      logger.log('deactivateDeviceToken: Deactivated token for current device');
    } catch (err) {
      logger.error('deactivateDeviceToken: Unexpected error', err);
    }
  }, []);

  const getCurrentToken = useCallback(async () => {
    try {
      const token = await messaging().getToken();
      console.log('Current FCM Token:', token);
      return token;
    } catch (err) {
      logger.error('getCurrentToken: Error getting token', err);
      return null;
    }
  }, []);

  return {
    registerDeviceToken,
    deactivateDeviceToken,
    getCurrentToken,
  };
}
