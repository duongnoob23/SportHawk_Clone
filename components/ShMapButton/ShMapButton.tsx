import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ShIcon } from '../ShIcon';
import { ShText } from '../ShText';
import { IconName } from '@con/icons';
import { colorPalette } from '@con/colors';
import { styles } from './styles';

interface ShMapButtonProps {
  onPress: () => void;
  iconSize?: number;
}

export const ShMapButton: React.FC<ShMapButtonProps> = ({
  onPress,
  iconSize = 20,
}) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <ShIcon
          name={IconName.Maps}
          size={iconSize}
          color={colorPalette.textLight}
        />
        <ShText style={styles.text}>Map</ShText>
      </View>
    </TouchableOpacity>
  );
};
