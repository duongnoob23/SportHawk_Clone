import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ShIcon } from '../ShIcon';
import { ShText } from '../ShText';

import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';

interface ShTeamListItemProps {
  teamName: string;
  ageGroup: string;
  gameplayLevel: string;
  onPress?: () => void;
}

export const ShTeamListItem: React.FC<ShTeamListItemProps> = ({
  teamName,
  ageGroup,
  gameplayLevel,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <ShText variant={ShTextVariant.Body} color={colorPalette.lightText}>
            {teamName}
          </ShText>
          <ShText variant={ShTextVariant.SmallX} color={colorPalette.stoneGrey}>
            {ageGroup} • {gameplayLevel}
          </ShText>
        </View>
        <ShIcon
          name={IconName.RightArrow}
          size={spacing.mdx}
          color={colorPalette.stoneGrey}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.borderRadiusXl,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    padding: spacing.containerPaddingListItem,
    height: spacing.heightListItem,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    gap: 5,
  },
});
