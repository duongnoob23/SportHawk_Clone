import React from 'react';
import { View, Image } from 'react-native';
import { ShText } from '@cmp/ShText';
import { ShIcon } from '@cmp/ShIcon';
import { styles } from './ShClubHeader.styles';
import { ShTextVariant } from '@con/typography';
import { IconName } from '@con/icons';
import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';

interface ShClubHeaderProps {
  clubBadgeUrl?: string;
  clubName: string;
  locationCity: string;
  locationState: string;
}

export const ShClubHeader: React.FC<ShClubHeaderProps> = ({
  clubBadgeUrl,
  clubName,
  locationCity,
  locationState,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {clubBadgeUrl ? (
          <Image source={{ uri: clubBadgeUrl }} style={styles.clubLogo} />
        ) : (
          <View style={styles.logoPlaceholder} />
        )}
      </View>
      <View style={styles.clubInfo}>
        <ShText variant={ShTextVariant.ClubName}>{clubName}</ShText>
        <View style={styles.locationRow}>
          <ShIcon
            name={IconName.Markervariant3}
            size={spacing.md}
            color={colorPalette.stoneGrey}
          />
          <ShText variant={ShTextVariant.LocationText}>
            {locationCity}, {locationState}
          </ShText>
        </View>
      </View>
    </View>
  );
};
