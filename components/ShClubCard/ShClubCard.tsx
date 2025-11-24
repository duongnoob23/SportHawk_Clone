import { ShButton } from '@cmp/ShButton';
import { ShIcon } from '@cmp/ShIcon';
import { ShText } from '@cmp/ShText';
import { ShButtonVariant } from '@con/buttons';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { ShTextVariant } from '@con/typography';
import { spacing } from '@top/constants/spacing';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ShAvatar } from '../ShAvatar';
import { ShSpacer } from '../ShSpacer';
import { styles } from './ShClubCard.styles';

interface ShClubCardProps {
  club: {
    id: string;
    name: string;
    location_city?: string;
    location_state?: string;
    member_count?: number;
    club_badge_url?: string | null;
    sportt_type?: string;
    team_count?: number;
  };
  onPress: (clubId: string) => void;
}

export const ShClubCard: React.FC<ShClubCardProps> = ({ club, onPress }) => {
  const handlePress = () => {
    onPress(club.id);
  };

  const location = [club.location_city, club.location_state]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.topContent}>
          <View style={styles.logoContainer}>
            {club.club_badge_url ? (
              <ShAvatar imageUri={club.club_badge_url}></ShAvatar>
            ) : (
              <View style={styles.logoPlaceholder}>
                <ShIcon
                  name={IconName.Badge}
                  size={32}
                  color={colorPalette.stoneGrey}
                />
              </View>
            )}
          </View>

          <View style={styles.info}>
            <ShText
              variant={ShTextVariant.Subheading}
              numberOfLines={1}
              style={styles.clubName}
            >
              {club.name}
            </ShText>
            <ShText variant={ShTextVariant.BodySmall} style={styles.teamName}>
              {`${club.sport_type} Club`}
              {/* Football club */}
            </ShText>
          </View>
        </View>
        <ShSpacer size={spacing.md} />
        <View style={[styles.locationRow]}>
          <ShIcon
            name={IconName.LocationPin}
            size={14}
            color={colorPalette.primaryGold}
          />
          <View style={{ marginLeft: spacing.xs }}>
            <ShText
              variant={ShTextVariant.Label}
              style={styles.locationText}
              numberOfLines={1}
            >
              {2.5} miles away • {club.team_count} teams
            </ShText>
          </View>
        </View>
      </TouchableOpacity>
      <ShSpacer size={spacing.md} />

      <View style={styles.buttonContainer}>
        <ShButton variant={ShButtonVariant.Primary} onPress={handlePress}>
          Learn More
        </ShButton>
      </View>
    </View>
  );
};
