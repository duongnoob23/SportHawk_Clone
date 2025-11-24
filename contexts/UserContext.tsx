// UserContext - Centralized authentication and user state management
// Wraps the entire app providing single source of truth for auth state

import { useDeviceToken } from '@hks/useDeviceToken';
import { logger } from '@lib/utils/logger';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {
  AuthChangeEvent,
  Session,
  User as SupabaseUser,
} from '@supabase/supabase-js';
import { supabase } from '@top/lib/supabase';
import useEventFormStore from '@top/stores/eventFormStore';
import * as Notifications from 'expo-notifications';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

// User profile type matching our database schema
export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  team_sort: 'Men' | 'Women' | null;
  profile_photo_uri: string | null;
  background_image_uri: string | null;
  is_sporthawk_admin: boolean | null;
  created_at: string;
  updated_at: string;
}

// SignUp data structure
export interface SignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  team_sort: 'Men' | 'Women';
}

export interface UpdateProfileResponse {
  success: boolean;
  error?: string | null;
}

export interface UpdatePasswordResponse {
  currentPass?: string;
  newPass?: string;
}
// Context type definition
export interface UserContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  authChecked: boolean;
  isResettingPassword: boolean;
  isVerifyEmail: boolean;
  isSignUp: boolean;
  setIsResettingPassword: (value: boolean) => void;
  userSignIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; isVerified?: boolean; message?: string }>;
  userSignOut: () => Promise<void>;
  userSignUp: (data: SignUpData) => Promise<void>;
  userVerify: (email: string, otp: string) => Promise<void>;
  userResendVerification: (email: string) => Promise<void>;
  userForgotPassword: (email: string) => Promise<void>;
  userResetPassword: (newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (
    updates: Partial<UserProfile>
  ) => Promise<UpdateProfileResponse>;
  updatePassword: (
    currentPass?: string,
    newPass?: string
  ) => Promise<UpdateProfileResponse>;
}

export const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: Readonly<PropsWithChildren>) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isVerifyEmail, setIsVerifyEmail] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const isFetchingRef = useRef(false);
  const { registerDeviceToken, deactivateDeviceToken } = useDeviceToken();

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      console.log('Profile fetch already in progress, skipping...');
      return null;
    }

    try {
      isFetchingRef.current = true;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Error fetching profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      logger.error('Error in fetchProfile:', error);
      return null;
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Sign in with email and password
  const userSignIn = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        logger.log('UserContext: Signing in user:', email);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        if (data.session && data.user) {
          setSession(data.session);
          setUser(data.user);

          // Fetch profile data
          const profileData = await fetchProfile(data.user.id);
          // Ensure the signed-in user is still current before applying profile
          const {
            data: { user: stillCurrent },
          } = await supabase.auth.getUser();
          if (stillCurrent?.id === data.user.id && profileData) {
            setProfile(profileData);
          }

          logger.log('UserContext: Sign in successful');

          // Register device token (non-blocking)
          void registerDeviceToken().catch(e =>
            logger.error('Register device token after sign-in failed', e)
          );

          // Return verification status
          return {
            success: true,
            isVerified: !!data.user.email_confirmed_at,
          };
        } else {
          throw new Error('Sign in failed - no session data');
        }
      } catch (error: unknown) {
        logger.error('UserContext: Sign in error:', error);
        const message =
          error instanceof Error ? error.message : 'Sign in failed';

        return {
          success: false,
          message,
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchProfile, registerDeviceToken]
  );

  // Sign up new user
  const userSignUp = useCallback(async (data: SignUpData) => {
    try {
      setIsSignUp(true);
      setLoading(true);
      logger.log('UserContext: Registering user:', {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        team_sort: data.team_sort,
      });

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            date_of_birth: data.date_of_birth,
            team_sort: data.team_sort,
          },
        },
      });

      if (error) throw error;

      if (authData.user) {
        // Profile will be created automatically by database trigger
        logger.log('UserContext: Sign up successful, verification email sent');
      }
    } catch (error: unknown) {
      logger.error('UserContext: Sign up error:', error);
      const message = error instanceof Error ? error.message : 'Sign up failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Resend verification email
  const userResendVerification = useCallback(async (email: string) => {
    try {
      setLoading(true);
      logger.log('UserContext: Resending verification email to:', email);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      logger.log('UserContext: Verification email resent successfully');
    } catch (error: unknown) {
      logger.error('UserContext: Resend verification error:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to resend verification email';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify email with OTP
  const userVerify = useCallback(
    async (email: string, otp: string) => {
      try {
        setIsVerifyEmail(true);
        setLoading(true);
        logger.log('UserContext: Verifying email:', email);

        const { data, error } = await supabase.auth.verifyOtp({
          email: email,
          token: otp,
          type: 'email',
        });

        if (error) {
          console.error('Error verify email');
          throw error;
        }

        if (data.session && data.user) {
          setSession(data.session);
          setUser(data.user);

          // Fetch profile data
          const profileData = await fetchProfile(data.user.id);
          // Ensure the signed-in user is still current before applying profile
          const {
            data: { user: stillCurrent },
          } = await supabase.auth.getUser();
          if (stillCurrent?.id === data.user.id && profileData) {
            setProfile(profileData);
          }

          logger.log('UserContext: Email verification successful');

          // Register device token (non-blocking)
          void registerDeviceToken().catch(e =>
            logger.error('Register device token after verification failed', e)
          );
        } else {
          console.log('RUN ELSE');

          // throw new Error('Verification failed - no session data');
        }
      } catch (error: unknown) {
        logger.error('UserContext: Verification error:', error);
        const message =
          error instanceof Error ? error.message : 'Verification failed';
        throw new Error(message);
      } finally {
        setLoading(false);
        setIsVerifyEmail(false);
      }
    },
    [fetchProfile, registerDeviceToken]
  );

  // Sign out user
  const userSignOut = useCallback(async () => {
    try {
      setLoading(true);
      logger.log('UserContext: Signing out user');

      // Deactivate current device token before signing out
      try {
        await deactivateDeviceToken();
      } catch (e) {
        logger.error('Deactivate device token on sign out failed', e);
      }

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      // Clear all user data
      setUser(null);
      setProfile(null);
      setSession(null);

      // Clear event form store on sign out
      const { clearForm } = useEventFormStore.getState();
      clearForm();

      logger.log('UserContext: Sign out successful');
    } catch (error: unknown) {
      logger.error('UserContext: Sign out error:', error);
      const message =
        error instanceof Error ? error.message : 'Sign out failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [deactivateDeviceToken]);

  // Request password reset
  const userForgotPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      logger.log('UserContext: Requesting password reset for:', email);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'sporthawk://ResetPassword', // Deep link for mobile app
      });

      if (error) {
        console.error('Error in reset password', error);
        throw error;
      }

      logger.log('UserContext: Password reset email sent');
    } catch (error: unknown) {
      logger.error('UserContext: Password reset error:', error);
      const message =
        error instanceof Error ? error.message : 'Password reset failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password with new password
  const userResetPassword = useCallback(async (newPassword: string) => {
    try {
      setLoading(true);
      logger.log('UserContext: Resetting password');

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      logger.log('UserContext: Password reset successful');
    } catch (error: unknown) {
      logger.error('UserContext: Password reset error:', error);
      const message =
        error instanceof Error ? error.message : 'Password reset failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh current user data
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      logger.log('UserContext: Refreshing user data');

      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      if (currentUser) {
        setUser(currentUser);

        // Refresh profile data
        const profileData = await fetchProfile(currentUser.id);
        if (profileData) {
          setProfile(profileData);
        }
      }
    } catch (error: unknown) {
      logger.error('UserContext: Refresh error:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  const updatePassword = useCallback(
    async (currentPass?: string, newPass?: string) => {
      try {
        if (!user) {
          return { success: false, error: 'No user logged in' };
        }
        if (!currentPass || !newPass) {
          return {
            success: false,
            error: 'Both current and new password are required',
          };
        }
        setLoading(true);
        logger.log('Change user password');

        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: currentPass,
        });

        if (verifyError) {
          logger.error('UserContext: Wrong current password:', verifyError);
          return { success: false, error: 'Current password is incorrect' };
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPass,
        });

        if (updateError) {
          logger.error('UserContext: update password fail', updateError);
          return { success: false, error: updateError.message };
        }

        logger.log('UserContext: update password success');
        return { success: true };
      } catch (error) {
        logger.error('UserContext: changePassword error:', error);
        const message =
          error instanceof Error ? error.message : 'Change password failed';
        return {
          success: false,
          error: message ?? 'Change password failed',
        };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );
  // Update user profile
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      try {
        if (!user) throw new Error('No user logged in');

        setLoading(true);
        logger.log('UserContext: Updating profile');

        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setProfile(data as UserProfile);
          logger.log('UserContext: Profile updated successfully');
          fetchProfile(user.id);
        }

        return {
          success: true,
          error: null,
        };
      } catch (error: unknown) {
        logger.error('UserContext: Profile update error:', error);
        const message =
          error instanceof Error ? error.message : 'Profile update failed';
        return {
          success: false,
          error: message,
        };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Notification handling (foreground taps, background taps, and cold start)
  useEffect(() => {
    // Set up Expo notifications handler for display behavior (foreground banners, sounds)
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: Platform.OS === 'ios',
        shouldShowList: Platform.OS === 'ios',
      }),
    });

    // Foreground message listener
    const unsubscribeOnMessage = messaging().onMessage(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        const title = remoteMessage.notification?.title ?? 'Notification';
        const body = remoteMessage.notification?.body ?? '';
        const data = remoteMessage.data ?? undefined;

        // Show a local notification for foreground messages
        await Notifications.scheduleNotificationAsync({
          content: { title, body, data },
          trigger: null,
        });
      }
    );

    // Handle notification opens from background
    const unsubscribeOnOpened = messaging().onNotificationOpenedApp(
      (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        const payload = remoteMessage.data ?? undefined;
        // Add navigation logic here if needed, using payload
        console.log('Notification opened from background with data:', payload);
      }
    );

    // Handle cold start open
    (async () => {
      const initialMessage = await messaging().getInitialNotification();
      if (initialMessage?.data) {
        console.log(
          'Notification opened app from quit state with data:',
          initialMessage.data
        );
        // Add navigation logic here if needed, using initialMessage.data
      }
    })();

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnOpened();
    };
  }, []);

  // Set up auth state listener
  useEffect(() => {
    // Get initial session
    (async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          logger.log('UserContext: Initial session restored');
        }
      } finally {
        setAuthChecked(true);
      }
    })();
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, currentSession: Session | null) => {
        logger.log('UserContext: Auth state changed:', _event);

        // Skip navigation if we're in password reset flow
        if (isResettingPassword) {
          logger.log(
            'UserContext: Skipping auth state handling - password reset in progress'
          );
          return; // Don't process auth state changes during password reset
        }

        if (isVerifyEmail) {
          logger.log(
            'UserContext: Skipping auth state handling - verify email in progress'
          );
          return;
        }
        if (isSignUp) {
          logger.log(
            'UserContext: Skipping auth state handling - sign up in progress'
          );
          setIsSignUp(false);

          return;
        }

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);

          // Ensure device token is registered when user becomes available
          // But skip during password reset to prevent unwanted navigation
          if (!isResettingPassword) {
            void registerDeviceToken().catch(e =>
              logger.error('Register device token on auth change failed', e)
            );
          }
        } else {
          // User signed out or no session
          setUser(null);
          setProfile(null);
          setSession(null);
        }
      }
    );

    // Cleanup subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [registerDeviceToken, isResettingPassword, isVerifyEmail, isSignUp]);

  useEffect(() => {
    if (!user?.id) return;
    if (isFetchingRef.current) return;
    let cancelled = false;
    const uid = user.id;
    (async () => {
      const profileData = await fetchProfile(uid);
      if (cancelled) return;
      if (profileData) {
        setProfile(profileData);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, fetchProfile]);

  const contextValue = useMemo(
    () => ({
      user,
      profile,
      session,
      loading,
      authChecked,
      isResettingPassword,
      isVerifyEmail,
      isSignUp,
      setIsSignUp,
      setIsVerifyEmail,
      setIsResettingPassword,
      userSignIn,
      userSignOut,
      userSignUp,
      userVerify,
      userResendVerification,
      userForgotPassword,
      userResetPassword,
      refreshUser,
      updateProfile,
      updatePassword,
    }),
    [
      user,
      profile,
      session,
      loading,
      authChecked,
      isResettingPassword,
      isVerifyEmail,
      isSignUp,
      setIsSignUp,
      userSignIn,
      userSignOut,
      userSignUp,
      userVerify,
      userResendVerification,
      userForgotPassword,
      userResetPassword,
      refreshUser,
      updateProfile,
      updatePassword,
    ]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
