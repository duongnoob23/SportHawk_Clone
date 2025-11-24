import { ShAvatar } from '@cmp/ShAvatar';
import { ShIcon } from '@cmp/ShIcon';
import { ShText } from '@cmp/ShText';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import React from 'react';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { styles } from './ShTeamHeader.styles';

interface ShTeamHeaderProps {
  teamName: string;
  teamType?: string;
  logoUrl?: string | null;
  onPress?: () => void;
  disabled?: boolean;
  showChevron?: boolean;
  rightAccessory?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ShTeamHeader: React.FC<ShTeamHeaderProps> = ({
  teamName,
  teamType,
  logoUrl,
  onPress,
  disabled = false,
  showChevron,
  rightAccessory,
  style,
}) => {
  const shouldShowChevron =
    (showChevron === undefined ? Boolean(onPress) : showChevron) &&
    !rightAccessory;

  const rightContent = rightAccessory ? (
    rightAccessory
  ) : shouldShowChevron ? (
    <View style={styles.actionContainer}>
      <ShIcon
        name={IconName.ChevronDown}
        size={spacing.iconSizeSmaller}
        color={'#9E9B97'}
      />
    </View>
  ) : null;

  const content = (
    <>
      <View style={styles.infoRow}>
        <ShAvatar
          size={spacing.avatarSizeLarge}
          imageUri={logoUrl}
          name={teamName}
        />
        <View style={styles.textContainer}>
          <ShText
            variant={ShTextVariant.ClubName}
            style={styles.teamName}
            numberOfLines={1}
          >
            {teamName}
          </ShText>
          {teamType ? (
            <ShText
              variant={ShTextVariant.LocationText}
              numberOfLines={1}
              style={styles.teamType}
            >
              {teamType}
            </ShText>
          ) : null}
        </View>
      </View>
      {rightContent}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, style, disabled && styles.disabled]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style, disabled && styles.disabled]}>
      {content}
    </View>
  );
};
