import { IconName } from '@con/icons';
import { ShAvatar } from '@top/components/ShAvatar';
import { ShButton } from '@top/components/ShButton';
import { ShText } from '@top/components/ShText';
import { ShButtonVariant } from '@top/constants/buttons';
import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { ShIcon } from '../ShIcon';
import { styles } from './styles';

interface ShMemberCardProps {
  avatar?: string;
  name: string;
  subtitle?: string;

  // For member removal (ADM-001, ADM-003)
  onRemove?: () => void;
  showRemoveIcon?: boolean;

  // For interested players (ADM-002)
  onAccept?: () => void;
  onIgnore?: () => void;
  showAcceptIgnoreButtons?: boolean;

  // For search results (ADM-002, ADM-003)
  onAdd?: () => void;
  showAddIcon?: boolean;

  isProcessing?: boolean;
}

export const ShMemberCard: React.FC<ShMemberCardProps> = ({
  avatar,
  name,
  subtitle,
  onRemove,
  showRemoveIcon = false,
  onAccept,
  onIgnore,
  showAcceptIgnoreButtons = false,
  onAdd,
  showAddIcon = false,
  isProcessing = false,
}) => {
  // Render the appropriate card layout based on props
  if (showAcceptIgnoreButtons) {
    // Interest expression card with buttons (ADM-002)
    return (
      <View style={styles.interestContainer}>
        <View style={styles.interestContent}>
          <ShAvatar imageUri={avatar} size={48} />
          <View style={styles.textContainer}>
            <ShText style={styles.name}>{name}</ShText>
            {subtitle && <ShText style={styles.subtitle}>{subtitle}</ShText>}
          </View>
          <ShIcon name={IconName.RightArrow} size={14} color="#9E9B97" />
        </View>
        <View style={styles.divider} />
        <View style={styles.buttonContainer}>
          <ShButton
            title="Accept"
            onPress={onAccept}
            variant={ShButtonVariant.Primary}
            style={styles.acceptButton}
            disabled={isProcessing}
            loading={isProcessing}
          />
          <ShButton
            title="Ignore"
            onPress={onIgnore}
            variant={ShButtonVariant.Secondary}
            style={styles.ignoreButton}
            disabled={isProcessing}
          />
        </View>
      </View>
    );
  }

  // Standard member card (ADM-001, ADM-003)
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ShAvatar imageUri={avatar} size={48} />
        <View style={styles.textContainer}>
          <ShText style={styles.name}>{name}</ShText>
          {subtitle && <ShText style={styles.subtitle}>{subtitle}</ShText>}
        </View>
      </View>

      {showRemoveIcon && onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          style={styles.iconButton}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#eabd22" />
          ) : (
            <View style={styles.removeIcon} />
          )}
        </TouchableOpacity>
      )}

      {showAddIcon && onAdd && (
        <TouchableOpacity
          onPress={onAdd}
          style={styles.iconButton}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#eabd22" />
          ) : (
            <View style={styles.addIconContainer}>
              <View style={styles.addIconHorizontal} />
              <View style={styles.addIconVertical} />
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};
