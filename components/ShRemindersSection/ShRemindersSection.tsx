import React, { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { ShText } from '@top/components/ShText';
import { ShIcon } from '@top/components/ShIcon';
import { ShTextVariant } from '@con/typography';
import { IconName } from '@con/icons';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { logger } from '@lib/utils/logger';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ShRemindersSectionProps {
  children: React.ReactNode;
  reminderCount: number;
}

export const ShRemindersSection: React.FC<ShRemindersSectionProps> = ({
  children,
  reminderCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    logger.log(
      '[USR-004] ShRemindersSection mounted with',
      reminderCount,
      'reminders'
    );
  }, [reminderCount]);

  if (reminderCount === 0) {
    logger.debug('[USR-004] No reminders to display, hiding section');
    return null;
  }

  const toggleExpanded = () => {
    logger.log(
      '[USR-004] Toggling reminders section:',
      !isExpanded ? 'expanding' : 'collapsing'
    );
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View
      style={{
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
      }}
    >
      <TouchableOpacity
        onPress={toggleExpanded}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: spacing.md,
        }}
        activeOpacity={0.7}
      >
        <ShText variant={ShTextVariant.SubHeading}>Reminders</ShText>
        <View
          style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
        >
          <ShIcon
            name={IconName.ChevronDown}
            size={20}
            color={colorPalette.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && <View style={{ gap: spacing.md }}>{children}</View>}
    </View>
  );
};
