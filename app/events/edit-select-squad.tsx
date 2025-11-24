import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  ShFormFieldTextArea,
  ShMemberListItem,
  ShScreenHeader,
  ShSpacer,
  ShText,
} from '@cmp/index';

import { colorPalette } from '@con/colors';
import { spacing } from '@con/spacing';
import { fontSizes, ShTextVariant } from '@con/typography';

import { IconName } from '@top/constants/icons';
import {
  INVITATION_STATUS,
  SQUAD_MODE,
} from '@top/features/event/constants/eventResponse';
import { useEventSquad } from '@top/features/event/hooks/useEventSquad';
import { useEventEditSelectSquadNotification } from '@top/features/event/hooks/useNotification';
import { useUpsertEventsquad } from '@top/features/event/hooks/useUpsertEventsquad';
import { EventDetailData, EventInvitation } from '@top/features/event/types';
import { getEventTitle } from '@top/features/event/utils';
import { useUser } from '@top/hooks/useUser';
import { useEventDefaults } from '@top/lib/utils/event';
import { logger } from '@top/lib/utils/logger';
import useEventFormStore from '@top/stores/eventFormStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditSelectSquadScreen() {
  const params = useLocalSearchParams<{
    teamId?: string;
    mode?: 'members' | 'leaders';
    data?: string;
    detailDataFix?: string;
    eventId?: string;
    description?: string;
  }>();
  const { formData, updateMemberSelection } = useEventFormStore();
  const { formatEventDate, formatEventTime } = useEventDefaults();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [preMatchMessage, setPreMatchMessage] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );
  useEffect(() => {
    if (params.description) {
      setPreMatchMessage(params.description);
    }
  }, [params.description]);
  const mode = params.mode || SQUAD_MODE.MEMBERS;
  const eventId = params.eventId;
  const hasMember = (formData.selectedMembers?.length ?? 0) > 0;

  const { data: squadMembers = [], isLoading: squadMembersLoading } =
    useEventSquad({ eventId });

  const { mutateAsync: upsertSquad, isPending: isPendingUpsertSquad } =
    useUpsertEventsquad();

  const { mutateAsync: sendEditSelectSquadNoti, isPending: isPendingNoti } =
    useEventEditSelectSquadNotification();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const newIds = new Set(squadMembers?.map(m => m.userId));
    setSelectedUserIds(prev => {
      const isSame =
        prev.size === newIds.size && [...prev].every(id => newIds.has(id));
      return isSame ? prev : newIds;
    });
  }, [squadMembers]);

  const responders = useMemo(() => {
    if (!params.data) return [];
    try {
      return JSON.parse(params.data) as EventInvitation[];
    } catch (error) {
      console.error('Error parsing responders data:', error);
      return [];
    }
  }, [params.data]);

  const availableMembers = useMemo(
    () =>
      (responders ?? []).filter(
        m => m.invitationStatus === INVITATION_STATUS.ACCEPTED
      ),
    [responders]
  );

  const maybeMembers = useMemo(
    () =>
      (responders ?? []).filter(
        m =>
          m.invitationStatus === INVITATION_STATUS.MAYBE ||
          m.invitationStatus === INVITATION_STATUS.PENDING
      ),
    [responders]
  );

  const notAvailableMembers = useMemo(
    () =>
      (responders ?? []).filter(
        m => m.invitationStatus === INVITATION_STATUS.DECLINED
      ),
    [responders]
  );

  const toggleMemberSelection = useCallback((userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const handleDone = async () => {
    try {
      setIsLoading(true);
      if (!params.eventId || !user?.id) {
        console.error('Missing required params');
        return;
      }
      const selectedArray = Array.from(selectedUserIds);
      // 🍋🍇
      const added = selectedArray.filter(
        id => !formData.selectedMembers?.includes(id)
      );

      const removed = formData.selectedMembers?.filter(
        id => !selectedArray.includes(id)
      );
      const userId = user.id;
      const result = await upsertSquad({
        teamId: params.teamId,
        userId: userId,
        eventId: params.eventId,
        selectedMembers: selectedArray,
        preMatchMessage: preMatchMessage,
        addMember: added,
        removeMember: removed,
        selectedBy: user.id,
      });

      if (result.success) {
        console.log('result >>>', result.message);
        if (mode === 'members') {
          updateMemberSelection(
            selectedArray,
            formData.selectedLeaders || [],
            preMatchMessage
          );
        }

        // useEventEditSelectSquadNotification
        try {
          logger.log('[EVENT-02] select squads requested', {
            eventId,
            count: added?.length,
          });
          const memberIds = added?.map(item => item);
          const detailDataFix = params?.detailDataFix;
          if (detailDataFix) {
            const eventData = JSON.parse(detailDataFix) as EventDetailData;
            const eventDate = formatEventDate(eventData.eventDate);
            const startTime = formatEventTime(eventData.startTime);
            const eventTitle = getEventTitle(eventData);

            memberIds?.map(item => {
              sendEditSelectSquadNoti({
                userId: item,
                eventId: params?.eventId!,
                eventName: getEventTitle(eventData) || 'Event',
                eventDate: `${eventDate} • ${startTime}` || 'time',
                eventTitle: eventTitle!,
              });
            });
          }
        } catch (error) {
          logger.error('[EVENT-01] REMINDER--DETAIL ERROR', error);
          Alert.alert(
            'Error',
            'Failed to send respon reminders. Please try again'
          );
        }
      } else {
        console.log('error in edit-select-squad.tsx after call handDone');
      }
      setIsLoading(false);
      router.back();
    } catch (error) {
      console.error('Failed to save squad:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const renderMembersList = (members: EventInvitation[]) => {
    if (members.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ShText variant={ShTextVariant.Body} style={styles.emptyText}>
            No{' '}
            {mode === SQUAD_MODE.LEADERS
              ? SQUAD_MODE.LEADERS
              : SQUAD_MODE.MEMBERS}{' '}
            found for this team
          </ShText>
        </View>
      );
    }

    return members.map((member: EventInvitation, index) => {
      const displayName = member.profiles
        ? `${member.profiles.firstName} ${member.profiles.lastName}`
        : 'Unknown';

      const subtitle =
        member.profiles.team_admins?.[0]?.role ||
        member.profiles.team_members?.[0]?.position ||
        'Player';

      return (
        <ShMemberListItem
          key={member.id}
          name={displayName}
          subtitle={subtitle}
          photoUri={member.profiles?.profilePhotoUri || ''}
          isSelected={selectedUserIds.has(member.userId)}
          isDisabled={member.invitationStatus === INVITATION_STATUS.DECLINED}
          onPress={() => toggleMemberSelection(member.userId)}
        />
      );
    });
  };

  const renderContent = () => {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'members' && (
          <>
            <ShSpacer size={spacing.xxl} />
            <ShFormFieldTextArea
              label="Pre-match Message"
              placeholder="Enter message"
              value={preMatchMessage}
              onChangeText={setPreMatchMessage}
              numberOfLines={5}
            />
            <ShText variant={ShTextVariant.Caption} style={styles.messageHint}>
              Your message will only be visible to those that are selected in
              the squad.
            </ShText>
          </>
        )}
        <ShSpacer size={spacing.xxl} />

        <View style={styles.sectionHeader}>
          <ShText variant={ShTextVariant.Body} style={styles.sectionTitle}>
            Available
          </ShText>
          <ShText variant={ShTextVariant.Selected} style={styles.selectedCount}>
            ({selectedUserIds.size} selected)
          </ShText>
        </View>
        <ShSpacer size={spacing.xxl} />
        {renderMembersList(availableMembers)}
        <ShSpacer size={spacing.md} />

        <View style={styles.sectionHeader}>
          <ShText variant={ShTextVariant.Body} style={styles.sectionTitle}>
            Others
          </ShText>
        </View>
        <ShSpacer size={spacing.xxl} />
        {renderMembersList(maybeMembers)}

        <ShSpacer size={spacing.lg} />
        <View style={[styles.sectionHeader]}>
          <ShText variant={ShTextVariant.Body} style={styles.sectionTitle}>
            Not Available
          </ShText>
        </View>
        <ShSpacer size={spacing.xxl} />
        {/* { paddingBottom: insets.bottom } */}
        {renderMembersList(notAvailableMembers)}
        <ShSpacer size={spacing.headerHeight} />
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, marginBottom: insets.bottom }}>
        <ShScreenHeader
          title="Select Squad"
          showBorder={true}
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
            onPress: handleBack,
          }}
          rightAction={{
            type: 'text',
            onPress: handleDone,
            text: 'Send',
            textColor: colorPalette.primaryGold,
          }}
        />
        <View
          style={[styles.loadingContainer, { marginBottom: insets.bottom }]}
        >
          <ActivityIndicator size="large" color={colorPalette.primaryGold} />
          <ShText>...Selecting squads</ShText>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        marginBottom: insets.bottom,
      }}
    >
      <ShScreenHeader
        title="Select Squad"
        showBorder={true}
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
          onPress: handleBack,
        }}
        rightAction={{
          type: 'text',
          onPress: handleDone,
          text: 'Send',
          textColor: colorPalette.primaryGold,
        }}
      />
      <View style={[{ flex: 1 }]}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
    borderTopWidth: spacing.borderWidthThin,
    borderTopColor: colorPalette.borderInputField,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.xxl,
    paddingVertical: 0,
  },
  messageHint: {
    color: colorPalette.stoneGrey,
    marginTop: spacing.sm,
    lineHeight: spacing.mdx,
    fontSize: fontSizes.xs,
  },
  borderMemberList: {
    padding: 16,
    borderWidth: 1,
    borderColor: colorPalette.borderSubtle,
    borderRadius: spacing.borderRadiusXLarge,
    marginBottom: 12,
    backgroundColor: colorPalette.backgroundListItem,
  },
  sectionHeader: {
    // marginTop: spacing.xxl,
    // marginBottom: spacing.xxl,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    color: colorPalette.white,
  },
  ButtonText: {},
  selectedCount: {
    color: colorPalette.primaryGold,
    fontSize: fontSizes.sm,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: colorPalette.textLight,
  },
});
