import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ShText } from '@top/components/ShText';
import { ShIcon } from '@top/components/ShIcon';
import { IconName } from '@con/icons';
import { styles } from './styles';

interface ShAdminGridProps {
  onMembersPress: () => void;
  onAdminsPress: () => void;
}

export const ShAdminGrid: React.FC<ShAdminGridProps> = ({
  onMembersPress,
  onAdminsPress,
}) => {
  const gridItems = [
    {
      id: 'events',
      label: 'Events',
      icon: IconName.Calendar,
      onPress: undefined,
      disabled: true,
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: IconName.Card,
      onPress: undefined,
      disabled: true,
    },
    {
      id: 'members',
      label: 'Members',
      icon: IconName.Team,
      onPress: onMembersPress,
      disabled: false,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: IconName.Bell,
      onPress: undefined,
      disabled: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: IconName.Settings,
      onPress: undefined,
      disabled: true,
    },
    {
      id: 'admins',
      label: 'Admins',
      icon: IconName.Admin,
      onPress: onAdminsPress,
      disabled: false,
    },
  ];

  return (
    <View style={styles.container}>
      {gridItems.map(item => (
        <TouchableOpacity
          key={item.id}
          style={[styles.button, item.disabled && styles.buttonDisabled]}
          onPress={item.onPress}
          disabled={item.disabled}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <ShIcon
              name={item.icon}
              size={36}
              color={item.disabled ? '#6b6b6a' : '#eabd22'}
            />
          </View>
          <ShText style={[styles.label, item.disabled && styles.labelDisabled]}>
            {item.label}
          </ShText>
        </TouchableOpacity>
      ))}
    </View>
  );
};
