import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShEmptyState, ShSpacer, ShText } from '@top/components';
import { ShUserListViewSquads } from '@top/components/ShUserListViewSquads/ShUserListViewSquads';
import { defaults } from '@top/constants/defaults';
import { ShTextVariant } from '@top/constants/typography';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { EventDetailData } from '../types';
type EventDetailCardProps = {
  eventItem?: EventDetailData;
  selectedUserIds: Set<string>;
};

const ViewSquads = ({ eventItem, selectedUserIds }: EventDetailCardProps) => {
  const members = useMemo(() => {
    if (!eventItem?.event_invitations) return [];

    const team = eventItem.event_invitations.filter(item =>
      selectedUserIds.has(item.userId)
    );
    if (!team) return [];

    return team.map((m: any) => ({
      id: m.id,
      user: {
        id: m.user_id,
        name:
          `${m.profiles?.firstName || ''} ${m.profiles?.lastName || ''}`.trim() ||
          'Unknown',
        profilePhoto: m.profiles?.profilePhotoUri || '',
      },
    }));
  }, [eventItem?.event_invitations, selectedUserIds]);

  return (
    <View style={styles.viewSquads}>
      <ShText variant={ShTextVariant.Subheading} style={styles.viewSquadsText}>
        View Squads
      </ShText>

      <ShSpacer size={spacing.mml} />

      <ShText style={styles.seletedText} variant={ShTextVariant.Body}>
        {`Selected (${selectedUserIds.size})`}
      </ShText>

      <ShSpacer size={spacing.mml} />

      {members.length > 0 ? (
        <View style={{ gap: spacing.lg }}>
          {members?.map((member: any, index: number) => (
            <ShUserListViewSquads
              key={member.id || index}
              name={member.user?.name || defaults.defaultRole || 'User'}
              role={defaults.defaultRole || 'Player'}
              photo={member.user?.profilePhoto}
              variant="default"
            />
          ))}
        </View>
      ) : (
        <ShEmptyState message={defaults.noMembers || 'No member'} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  viewSquads: {
    backgroundColor: colorPalette.baseDark,
  },
  viewSquadsText: {
    color: colorPalette.textLight,
  },
  seletedText: {
    color: colorPalette.primaryGold,
  },
  detailsCard: {
    backgroundColor: `rgba(0, 0, 0, 0.3)`,
    borderWidth: spacing.borderWidthThin,
    borderColor: `rgba(158, 155, 151, 0.2)`,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    gap: spacing.xs,
  },
  detailLabel: {
    color: colorPalette.stoneGrey,
  },
  detailValue: {
    color: colorPalette.textLight,
  },
  detailSubValue: {
    color: colorPalette.stoneGrey,
    marginTop: spacing.xs,
  },
});

export default ViewSquads;
