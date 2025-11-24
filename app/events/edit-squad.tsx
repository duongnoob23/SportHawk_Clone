import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ShFormFieldTextArea,
  ShMemberListItem,
  ShSpacer,
  ShText,
} from '@cmp/index';

import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { ShTextVariant, fontSizes, fontWeights } from '@con/typography';

import { teamsApi } from '@lib/api/teams';
import useEventFormStore from '@top/stores/eventFormStore';

interface MemberData {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  profile_photo_uri: string | null;
  position?: string | null;
  role?: string | null;
  title?: string | null;
  is_admin?: boolean;
}

export default function EditSquadScreen() {
  const params = useLocalSearchParams<{
    teamId: string;
    mode?: 'members' | 'leaders';
  }>();

  const { formData, updateMemberSelection } = useEventFormStore();

  const [loading, setLoading] = useState(true);
  const [preMatchMessage, setPreMatchMessage] = useState('');
  const [allMembers, setAllMembers] = useState<MemberData[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );
  const mode = params.mode || 'members';

  useEffect(() => {
    loadTeamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.teamId]);

  useEffect(() => {
    // Initialize from store based on mode
    if (mode === 'members') {
      setSelectedUserIds(new Set(formData.selectedMembers || []));
    } else {
      setSelectedUserIds(new Set(formData.selectedLeaders || []));
    }
    setPreMatchMessage(formData.preMatchMessage || '');
  }, [
    mode,
    formData.selectedMembers,
    formData.selectedLeaders,
    formData.preMatchMessage,
  ]);

  const loadTeamData = async () => {
    if (!params.teamId) {
      Alert.alert('Error', 'No team ID provided');
      router.back();
      return;
    }

    try {
      setLoading(true);

      if (mode === 'leaders') {
        const admins = await teamsApi.getTeamAdminsSimple(params.teamId);
        const adminData: MemberData[] = admins.map(admin => ({
          id: admin.id,
          user_id: admin.user_id,
          first_name: admin.profile?.first_name || null,
          last_name: admin.profile?.last_name || null,
          profile_photo_uri: admin.profile?.profile_photo_uri || null,
          role: admin.role,
          title: admin.title,
          is_admin: true,
        }));
        setAllMembers(adminData);
      } else {
        const members = await teamsApi.getTeamMembersSimple(params.teamId);
        const memberData: MemberData[] = members.map(member => ({
          id: member.id,
          user_id: member.user_id,
          first_name: member.profile?.first_name || null,
          last_name: member.profile?.last_name || null,
          profile_photo_uri: member.profile?.profile_photo_uri || null,
          position: member.position,
        }));
        setAllMembers(memberData);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      Alert.alert('Error', 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberSelection = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleDone = () => {
    const selectedArray = Array.from(selectedUserIds);

    if (mode === 'members') {
      updateMemberSelection(
        selectedArray,
        formData.selectedLeaders || [],
        preMatchMessage
      );
    } else {
      updateMemberSelection(
        formData.selectedMembers || [],
        selectedArray,
        preMatchMessage
      );
    }

    router.back();
  };

  const renderMembersList = () => {
    if (allMembers.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ShText variant={ShTextVariant.Body} style={styles.emptyText}>
            No {mode === 'leaders' ? 'leaders' : 'members'} found for this team
          </ShText>
        </View>
      );
    }

    return allMembers.map(member => {
      const displayName =
        `${member.first_name || ''} ${member.last_name || ''}`.trim() ||
        'Unknown';
      const subtitle =
        mode === 'leaders'
          ? member.title || member.role || 'Coach'
          : member.position || 'Player';

      return (
        <ShMemberListItem
          key={member.id}
          name={displayName}
          subtitle={subtitle}
          photoUri={member.profile_photo_uri}
          isSelected={selectedUserIds.has(member.user_id)}
          onPress={() => toggleMemberSelection(member.user_id)}
        />
      );
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colorPalette.primaryGold} />
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'members' && (
          <>
            <ShFormFieldTextArea
              label="Pre-match Message"
              placeholder="Enter message for selected squad members"
              value={preMatchMessage}
              onChangeText={setPreMatchMessage}
              numberOfLines={3}
            />
            <ShText variant={ShTextVariant.Caption} style={styles.messageHint}>
              Your message will only be visible to those that are selected in
              the squad.
            </ShText>
            <ShSpacer size={spacing.xxl} />
          </>
        )}

        <View style={styles.sectionHeader}>
          <ShText
            variant={ShTextVariant.SectionTitle}
            style={styles.sectionTitle}
          >
            {mode === 'leaders' ? 'Available Leaders' : 'Team Members'}
          </ShText>
          <ShText
            variant={ShTextVariant.ButtonText}
            style={styles.selectedCount}
          >
            ({selectedUserIds.size} selected)
          </ShText>
        </View>

        <View>{renderMembersList()}</View>
      </ScrollView>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: mode === 'leaders' ? 'Select Leaders' : 'Select Squad',
          headerBackTitle: '',
          presentation: 'card',
          headerStyle: {
            backgroundColor: colorPalette.baseDark,
          },
          headerTintColor: colorPalette.white,
          headerTitleStyle: {
            fontWeight: fontWeights.medium,
            fontSize: fontSizes.lg,
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={handleDone}
              style={{ marginRight: spacing.md }}
            >
              <ShText
                variant={ShTextVariant.ButtonText}
                style={{ color: colorPalette.primaryGold }}
              >
                Done
              </ShText>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={{ flex: 1, backgroundColor: colorPalette.baseDark }}>
        {renderContent()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.xl,
  },
  messageHint: {
    color: colorPalette.textSubtle,
    marginTop: spacing.sm,
    lineHeight: spacing.mdx,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colorPalette.white,
    flex: 1,
  },
  selectedCount: {
    color: colorPalette.primaryGold,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: colorPalette.textSubtle,
  },
});
