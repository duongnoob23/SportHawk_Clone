import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ShText } from '@top/components/ShText';
import { ShIcon } from '@top/components/ShIcon';
import { IconName } from '@con/icons';
import { styles } from './styles';

interface ShAddMembersCardProps {
  count: number;
  onPress: () => void;
}

export const ShAddMembersCard: React.FC<ShAddMembersCardProps> = ({
  count,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={count > 0 ? onPress : undefined}
      disabled={count === 0}
      activeOpacity={count > 0 ? 0.7 : 1}
    >
      <View style={styles.content}>
        <View style={styles.alertIconContainer}>
          <ShIcon name={IconName.Alert} size={16} color="#eabd22" />
        </View>
        <View style={styles.textContainer}>
          <ShText style={styles.title}>Add members</ShText>
          <ShText style={styles.subtitle}>{count} interested</ShText>
        </View>
      </View>
      {count > 0 && (
        <ShIcon name={IconName.RightArrow} size={14} color="#9E9B97" />
      )}
    </TouchableOpacity>
  );
};
