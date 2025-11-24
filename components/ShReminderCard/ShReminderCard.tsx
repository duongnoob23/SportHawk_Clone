import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShText } from '@top/components/ShText';
import { ShButton } from '@top/components/ShButton';
import { ShIcon } from '@top/components/ShIcon';
import { ShTextVariant } from '@con/typography';
import { ShButtonVariant } from '@con/buttons';
import { IconName } from '@con/icons';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { logger } from '@lib/utils/logger';

export type ReminderType =
  | 'profile_picture'
  | 'complete_profile'
  | 'verify_email';

interface ShReminderCardProps {
  type: ReminderType;
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
  icon?: IconName;
}

export const ShReminderCard: React.FC<ShReminderCardProps> = ({
  type,
  title,
  description,
  buttonText,
  onAction,
  icon = IconName.Alert,
}) => {
  const handleAction = () => {
    logger.log('[USR-004] Reminder card action triggered:', {
      type,
      action: buttonText,
    });
    onAction();
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <ShIcon name={icon} size={24} color={colorPalette.primaryGold} />
      </View>

      <View style={styles.content}>
        <ShText variant={ShTextVariant.Body}>{title}</ShText>
        <ShText
          variant={ShTextVariant.Small}
          color={colorPalette.textSecondary}
          style={styles.description}
        >
          {description}
        </ShText>

        <View style={styles.buttonContainer}>
          <ShButton
            title={buttonText}
            variant={ShButtonVariant.Primary}
            onPress={handleAction}
            size="small"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colorPalette.cardBackground,
    borderRadius: spacing.borderRadiusMedium,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colorPalette.borderInputField,
    flexDirection: 'row',
    gap: spacing.md,
    shadowColor: colorPalette.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: spacing.xxl / 2,
    backgroundColor: colorPalette.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  description: {
    marginTop: spacing.xs,
  },
  buttonContainer: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
});
