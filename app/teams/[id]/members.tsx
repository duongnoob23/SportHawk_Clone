import { defaults } from '@con/defaults';
import { spacing } from '@con/spacing';
import { logger } from '@lib/utils/logger';
import {
  ShEmptyState,
  ShScreenContainer,
  ShSectionHeader,
  ShUserList,
} from '@top/components';
import { ClubDetailsResponse } from '@top/features/clubs/types';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, ScrollView, View } from 'react-native';


export type Props = {
  clubDetailsData?: ClubDetailsResponse;
};

export default function TeamMembersScreen(clubDetailsData?: Props) {
  const { id } = useLocalSearchParams<{ id: string }>();

  const members = useMemo(() => {
    if (!clubDetailsData?.clubDetailsData?.teams) return [];

    const team = clubDetailsData.clubDetailsData.teams.find(t => t.id === id);
    if (!team) return [];

    return team.teamMembers.map((m: any) => ({
      id: m.id,
      role: m.role || 'member',
      joinedAt: m.joined_at,
      user: {
        id: m.user_id,
        name:
          `${m.profiles?.first_name || ''} ${m.profiles?.last_name || ''}`.trim() ||
          'Unknown',
        profilePhoto: m.profiles?.profile_photo_uri || '',
      },
    }));
  }, [clubDetailsData, id]);

  const admins = useMemo(() => {
    const teamAdmins = clubDetailsData?.clubDetailsData?.clubAdmins;
    if (!teamAdmins) return [];

    return teamAdmins.map(admin => ({
      id: admin.id,
      role: admin.role,
      joinedAt: '',
      lastActive: '',
      user: {
        id: admin.profiles?.id,
        name:
          `${admin.profiles?.firstName || ''} ${admin.profiles?.lastName || ''}`.trim() ||
          'Unknown',
        profilePhoto: admin.profiles?.profilePhotoUri,
      },
    }));
  }, [clubDetailsData]);

  const handleMemberTap = (memberId: string) => {
    logger.debug('MEM-004: Member tapped', { memberId });
    Alert.alert('Feature coming soon!');
  };

  return (
    <ShScreenContainer>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            padding: spacing.xxl,
            paddingTop: 0,
            gap: spacing.xxl,
            paddingHorizontal: 0,
          }}
        >
          {/* Admins Section */}
          <ShSectionHeader title="Admins" />
          {admins.length > 0 ? (
            <View style={{ gap: spacing.sectionListGap }}>
              {admins.map((admin: any, index: number) => (
                <ShUserList
                  key={admin.id || index}
                  name={admin.user?.name || defaults.defaultAdminRole}
                  role={admin.role || defaults.defaultAdminRole}
                  photo={admin.user?.profilePhoto}
                  variant="admin"
                  onPress={() => handleMemberTap(admin.id)}
                />
              ))}
            </View>
          ) : (
            <ShEmptyState message={defaults.noAdmins} />
          )}

          {/* Members Section */}
          <ShSectionHeader title="Members" />
          {members.length > 0 ? (
            <View style={{ gap: spacing.sectionListGap }}>
              {members.map((member: any, index: number) => (
                <ShUserList
                  key={member.id || index}
                  name={member.user?.name || defaults.defaultRole}
                  role={defaults.defaultRole}
                  photo={member.user?.profilePhoto}
                  variant="default"
                  onPress={() => handleMemberTap(member.id)}
                />
              ))}
            </View>
          ) : (
            <ShEmptyState message={defaults.noMembers} />
          )}
        </View>
      </ScrollView>
    </ShScreenContainer>
  );
}
