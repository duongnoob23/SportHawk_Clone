import { ShIcon, ShText } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { fontSizes, fontWeights, ShTextVariant } from '@con/typography';
import { useLayout } from '@top/hooks/useLayout';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type HeaderActionType = 'icon' | 'text' | 'loading';

interface HeaderAction {
  type: HeaderActionType;
  iconName?: IconName;
  text?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingColor?: string;
  textColor?: string;
  iconColor?: string;
}

interface ShScreenHeaderProps {
  title: string;
  leftAction?: HeaderAction;
  rightAction?: HeaderAction;
  backgroundColor?: string;
  titleColor?: string;
  showBorder?: boolean;
  notShowLeft?: boolean;
  autoLeft?: boolean;
}

export const ShScreenHeader: React.FC<ShScreenHeaderProps> = ({
  title,
  leftAction,
  rightAction,
  backgroundColor = colorPalette.baseDark,
  titleColor = colorPalette.lightText,
  showBorder = false,
  notShowLeft = false,
  autoLeft = false,
}) => {
  const { onLayout, height } = useLayout();
  const insets = useSafeAreaInsets();
  const [leftWidth, setLeftWidth] = React.useState(0);
  const [rightWidth, setRightWidth] = React.useState(0);
  const [maxWidth, setMaxWidth] = React.useState(0);

  React.useEffect(() => {
    const width = Math.max(leftWidth, rightWidth);
    setMaxWidth(width);
  }, [leftWidth, rightWidth]);

  const renderAction = (action: HeaderAction, side: 'left' | 'right') => {
    if (!action && side === 'left') {
      return null;
    }
    if (!action && side === 'right') {
      return <View style={[styles.actionPlaceholder, { width: maxWidth }]} />;
    }
    const {
      type,
      onPress,
      disabled,
      loading,
      loadingColor,
      textColor,
      iconColor,
    } = action;
    const isDisabled = disabled || loading;

    const actionStyle = [
      styles.actionButton,
      side === 'left' ? styles.leftAction : styles.rightAction,
      maxWidth > 0 && { width: maxWidth },
    ];

    if (type === 'loading') {
      return (
        <View style={actionStyle}>
          <ActivityIndicator
            size="small"
            color={loadingColor || colorPalette.primaryGold}
          />
        </View>
      );
    }

    if (type === 'text') {
      return (
        <TouchableOpacity
          onPress={onPress}
          style={actionStyle}
          disabled={isDisabled}
          onLayout={
            side === 'left'
              ? e => setLeftWidth(e.nativeEvent.layout.width)
              : e => setRightWidth(e.nativeEvent.layout.width)
          }
        >
          <ShText
            variant={ShTextVariant.Body}
            style={[
              styles.actionText,
              { color: textColor || colorPalette.primaryGold },
              isDisabled && styles.disabled,
            ]}
          >
            {action.text}
          </ShText>
        </TouchableOpacity>
      );
    }

    if (type === 'icon') {
      return (
        <TouchableOpacity
          onPress={onPress}
          style={[
            actionStyle,
            side === 'right' && {
              borderRadius: spacing.md,
              borderColor: colorPalette.borderColorLight,
              borderWidth: spacing.xxxs,
              width: spacing.buttonHeightMedium,
              height: spacing.buttonHeightMedium,
            },
            side === 'left' && {
              borderRadius: spacing.md,
            },
          ]}
          disabled={isDisabled}
          onLayout={
            side === 'left'
              ? e => setLeftWidth(e.nativeEvent.layout.width)
              : e => setRightWidth(e.nativeEvent.layout.width)
          }
        >
          <View
            style={
              side === 'right' && {
                width: '100%',
                height: spacing.xxl,
                alignItems: 'center',
                justifyContent: 'center',
              }
            }
          >
            <ShIcon
              name={action.iconName!}
              size={side === 'left' ? spacing.mml : spacing.lg}
              color={iconColor || colorPalette.lightText}
            />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={[
          styles.actionPlaceholder,
          side === 'right' && maxWidth > 0 && { width: maxWidth },
        ]}
      />
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        showBorder && styles.withBorder,

        autoLeft && { justifyContent: 'flex-start' },
      ]}
      onLayout={onLayout}
    >
      <View>{renderAction(leftAction!, 'left')}</View>

      <View
        style={[
          styles.titleContainer,
          !leftAction && styles.titleAlignLeft,
          autoLeft && { alignItems: 'flex-start' },
        ]}
      >
        <ShText
          variant={ShTextVariant.Body}
          style={[
            styles.title,
            {
              color: titleColor,
              fontWeight: fontWeights.regular,
              fontSize: fontSizes.md,
            },
          ]}
        >
          {title}
        </ShText>
      </View>

      <View>{renderAction(rightAction!, 'right')}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPalette.baseDark,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleAlignLeft: {
    alignItems: 'flex-start',
  },
  withBorder: {
    borderBottomWidth: spacing.borderWidthThin,
    borderBottomColor: colorPalette.paymentButtonBorder,
  },
  actionButton: {
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftAction: { alignItems: 'flex-start' },
  rightAction: { alignItems: 'flex-end' },
  actionPlaceholder: {
    width: spacing.iconSizeMedium + spacing.sm * 2,
    height: spacing.iconSizeMedium + spacing.sm * 2,
  },
  title: {
    textAlign: 'center',
  },
  actionText: {
    fontWeight: fontWeights.regular,
  },
  disabled: {
    opacity: 0.5,
  },
});
