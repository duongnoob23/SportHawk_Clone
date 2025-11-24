import {
  ShLoadingSpinner,
  ShMarkdownViewer,
  ShScreenContainer,
  ShScreenHeader,
  ShText,
} from '@cmp/index';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { IconName } from '@top/constants/icons';
import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function TermsServiceScreen() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarkdownContent();
  }, []);

  const loadMarkdownContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load the markdown file as an asset
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const asset = Asset.fromModule(
        require('@top/info/terms_and_conditions.md')
      );
      await asset.downloadAsync();

      // Fetch the content from the local URI
      if (asset.localUri) {
        const response = await fetch(asset.localUri);
        const text = await response.text();
        setContent(text);
      } else {
        throw new Error('Failed to load terms and conditions');
      }
    } catch (err) {
      console.error('Error loading markdown:', err);
      setError('Failed to load terms and conditions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ShScreenHeader
        title="Term & Service"
        showBorder={true}
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
          onPress: () => router.back(),
        }}
      />
      <ScrollView style={{ flex: 1 }}>
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
                Loading terms and conditions...
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
            <ShMarkdownViewer content={content} />
          )}
        </ShScreenContainer>
      </ScrollView>
    </>
  );
}
