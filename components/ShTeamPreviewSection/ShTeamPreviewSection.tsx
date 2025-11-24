import { ShTeamListItem } from '@cmp/ShTeamListItem';
import { ShText } from '@cmp/ShText';
import { ShTextVariant } from '@con/typography';
import { spacing } from '@top/constants/spacing';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ShSpacer } from '../ShSpacer';
import { styles } from './ShTeamPreviewSection.styles';

interface Team {
  id: string;
  name: string;
  sport: string;
  age_group?: string;
  team_sort?: string;
}
interface ShTeamPreviewSectionProps {
  teams: Team[];
  maxDisplay?: number;
  onViewAll: () => void;
  onTeamPress: (teamId: string) => void;
}

export const ShTeamPreviewSection: React.FC<ShTeamPreviewSectionProps> = ({
  teams,
  maxDisplay = 3,
  onViewAll,
  onTeamPress,
}) => {
  const displayTeams = teams.slice(0, maxDisplay);
  const hasMoreTeams = teams.length > maxDisplay;

  return (
    <View style={styles.container}>
      <ShText variant={ShTextVariant.Subheading}>Teams</ShText>
      <ShSpacer size={spacing.xxl} />
      <View style={styles.teamsList}>
        {displayTeams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShText variant={ShTextVariant.EmptyState}>No teams found</ShText>
          </View>
        ) : (
          displayTeams.map(team => (
            <ShTeamListItem
              key={team.id}
              teamName={team.name}
              ageGroup={team.age_group || 'Open'}
              gameplayLevel={team.sport}
              onPress={() => onTeamPress(team.id)}
            />
          ))
        )}
      </View>
      {hasMoreTeams && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={onViewAll}
          activeOpacity={0.8}
        >
          <ShText variant={ShTextVariant.ButtonText}>View All Teams</ShText>
        </TouchableOpacity>
      )}
    </View>
  );
};
