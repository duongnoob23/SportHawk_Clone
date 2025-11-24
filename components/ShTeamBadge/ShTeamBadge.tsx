import React from 'react';
import { View, Image } from 'react-native';
import { ShText } from '../ShText';
import { ShTextVariant } from '@con/typography';
import { styles } from './styles';

interface ShTeamBadgeProps {
  logoUrl?: string;
  teamName: string;
  category?: string;
}

export const ShTeamBadge: React.FC<ShTeamBadgeProps> = ({
  logoUrl,
  teamName,
  category,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {logoUrl && <Image source={{ uri: logoUrl }} style={styles.logo} />}
      </View>
      <View style={styles.textContainer}>
        <ShText variant={ShTextVariant.ClubName}>{teamName}</ShText>
        {category && (
          <ShText variant={ShTextVariant.LocationText}>{category}</ShText>
        )}
      </View>
    </View>
  );
};
