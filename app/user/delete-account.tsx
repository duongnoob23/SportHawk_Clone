import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Asset } from 'expo-asset';
import {
  ShScreenContainer,
  ShMarkdownViewer,
  ShLoadingSpinner,
  ShText,
  ShButton,
  ShSpacer,
} from '@cmp/index';
import { colorPalette } from '@con/colors';
import { fontWeights, fontSizes, ShTextVariant } from '@con/typography';
import { spacing } from '@con/spacing';
import { supabase } from '@lib/supabase';
import { format } from 'date-fns';
import { useUser } from '@hks/useUser';
import { ShButtonVariant } from '@con/buttons';
import { Routes } from '@con/routes';

export default function DeleteAccountScreen() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateDeleteAccountStarted, setDateDeleteAccountStarted] =
    useState<string>('');
  const { user, userSignOut } = useUser();

  useEffect(() => {
    loadMarkdownContent();
    getStartAccountDeleteColumn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: Migrate function in user api
  const getStartAccountDeleteColumn = async () => {
    try {
      if (!user) {
        setDateDeleteAccountStarted('');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('start_account_delete')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching start_account_delete:', error);
        setDateDeleteAccountStarted('');
        return;
      }

      if (data?.start_account_delete) {
        const date = new Date(data.start_account_delete);
        const formattedDate = format(date, 'PPPP');
        setDateDeleteAccountStarted(formattedDate);
      } else {
        setDateDeleteAccountStarted('');
      }
    } catch (err) {
      console.error('Error in getStartAccountDeleteColumn:', err);
      setDateDeleteAccountStarted('');
    }
  };

  const handleStartAccountDelete = async () => {
    Alert.alert(
      'Confirm Account Deletion',
      'Click OK to confirm that you wish to start the process of deleting your account. Please note that you will be immediately Signed Out of this Application.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              if (!user) return;
              // TODO: Migrate this to be a function in user api
              // Update the start_account_delete timestamp
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ start_account_delete: 'now()' })
                .eq('id', user.id);

              if (updateError) {
                console.error(
                  'Error updating start_account_delete:',
                  updateError
                );
                Alert.alert(
                  'Error',
                  'Failed to start account deletion process. Please try again.'
                );
                return;
              }

              // Sign out the user
              await userSignOut();

              // Navigate to Welcome page
              router.replace(Routes.Welcome);
            } catch (err) {
              console.error('Error in handleStartAccountDelete:', err);
              Alert.alert(
                'Error',
                'An unexpected error occurred. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const loadMarkdownContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load the markdown file as an asset
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const asset = Asset.fromModule(require('@top/info/delete_account.md'));
      await asset.downloadAsync();

      // Fetch the content from the local URI
      if (asset.localUri) {
        const response = await fetch(asset.localUri);
        const text = await response.text();
        setContent(text);
      } else {
        throw new Error('Failed to load account delete info');
      }
    } catch (err) {
      console.error('Error loading markdown:', err);
      setError('Failed to load account delete info. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Delete Account',
          headerStyle: {
            backgroundColor: colorPalette.baseDark,
          },
          headerTintColor: colorPalette.textLight,
          headerTitleStyle: {
            fontWeight: fontWeights.medium as any,
            fontSize: fontSizes.lg,
          },
        }}
      />
      <ShScreenContainer>
        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: spacing.xxxl,
            }}
          >
            <ShLoadingSpinner />
            <ShText
              variant={ShTextVariant.Body}
              style={{
                marginTop: spacing.lg,
                color: colorPalette.textSecondary,
              }}
            >
              Loading account delete info...
            </ShText>
          </View>
        ) : error ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.xxxl,
            }}
          >
            <ShText
              variant={ShTextVariant.Body}
              style={{
                color: colorPalette.error,
                textAlign: 'center',
              }}
            >
              {error}
            </ShText>
          </View>
        ) : (
          <>
            <View
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.xl,
              }}
            >
              {dateDeleteAccountStarted.length > 8 ? (
                <View
                  style={{
                    padding: spacing.lg,
                    backgroundColor: colorPalette.surface,
                    borderRadius: spacing.borderRadius,
                    borderWidth: 1,
                    borderColor: colorPalette.borderColor,
                  }}
                >
                  <ShText
                    variant={ShTextVariant.Body}
                    style={{
                      color: colorPalette.textLight,
                      textAlign: 'center',
                    }}
                  >
                    Your account deletion was started at:{' '}
                    {dateDeleteAccountStarted}
                  </ShText>
                </View>
              ) : (
                <>
                  <ShButton
                    variant={ShButtonVariant.Primary}
                    onPress={handleStartAccountDelete}
                  >
                    Start Account Deletion
                  </ShButton>
                  <ShSpacer size={spacing.xl} />
                </>
              )}
            </View>
            <ShMarkdownViewer content={content} />
          </>
        )}
      </ShScreenContainer>
    </>
  );
}
