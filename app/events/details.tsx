import { ShScreenHeader, ShSpacer, ShText } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { fontSizes, fontWeights, ShTextVariant } from '@con/typography';
import { useUser } from '@hks/useUser';
import { IconName } from '@top/constants/icons';
import AnswerBySection from '@top/features/event/components/AnswerBySection';
import EventDetailCard from '@top/features/event/components/EventDetailCard';
import EventDropdown from '@top/features/event/components/EventDropdown';
import EventMap from '@top/features/event/components/EventMap';
import EventResponses from '@top/features/event/components/EventResponses';
import EventSquadsCard from '@top/features/event/components/EventSquadsCard';
import EventTitleAndTeam from '@top/features/event/components/EventTitleAndTeam';
import ViewSquads from '@top/features/event/components/ViewSquads';
import {
  EVENT_ACTION,
  INVITATION_STATUS,
  SQUAD_MODE,
} from '@top/features/event/constants/eventResponse';
import { useEventDetail } from '@top/features/event/hooks/useEventDetail';
import { useEventSquad } from '@top/features/event/hooks/useEventSquad';
import { useEventReminderNotification } from '@top/features/event/hooks/useNotification';
import type { EvenDetails, EventDropdownItem } from '@top/features/event/types';
import {
  checkInvitationsStatus,
  countInvitationStatus,
  formatEventInvitation,
  getEventTitle,
} from '@top/features/event/utils';
import RSVPButtons from '@top/features/teams/components/Events/RSVPButtons';
import { UserEvent } from '@top/features/teams/types';
import { useEventDefaults } from '@top/lib/utils/event';
import { logger } from '@top/lib/utils/logger';
import useEventFormStore from '@top/stores/eventFormStore';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EventDetailsScreen() {
  const { user } = useUser();
  const params = useLocalSearchParams<{
    eventData: string;
    eventId?: string;
    teamId?: string;
  }>();
  const {
    clearForm,
    clearFormEditEvent,
    clearFormEditSelectSquad,
    updateMemberSelection,
  } = useEventFormStore();
  const { formatEventDate, formatEventTime } = useEventDefaults();
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [eventItem, setEventItem] = useState<EvenDetails | null>(null);
  const [eventItemTeams, setEventItemTeams] = useState<UserEvent | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );
  const eventId = params.eventId || eventItem?.event_id;
  const teamId = params.teamId;
  const userId = user?.id;
  const insets = useSafeAreaInsets();
  const isAdmin = user?.app_metadata.is_super_admin || false;
  const {
    data: detailDataFix,
    isLoading,
    isError,
  } = useEventDetail({
    eventId,
    userId,
    teamId,
  });

  const { data: squadMembers = [], isLoading: squadMembersLoading } =
    useEventSquad({ eventId });

  const description = useMemo(() => {
    if (detailDataFix?.event_squads.length !== 0) {
      let content = detailDataFix?.event_squads[0].selectionNotes;
      return content;
    } else {
      let content = 'No message';
      return content;
    }
  }, [detailDataFix]);

  const formatEventItem = useMemo(() => {
    if (!detailDataFix) {
      return;
    }
    const data = formatEventInvitation(detailDataFix);
    return data;
  }, [detailDataFix]);
  const { mutateAsync: sendEventReminder, isPending: sendEventPending } =
    useEventReminderNotification();

  useEffect(() => {
    const newIds = new Set(squadMembers?.map(m => m.userId));
    setSelectedUserIds(prev => {
      const isSame =
        prev.size === newIds.size && [...prev].every(id => newIds.has(id));
      return isSame ? prev : newIds;
    });
  }, [squadMembers]);

  useEffect(() => {
    if (detailDataFix && userId) {
      const userIds = detailDataFix.event_squads
        .filter(item => item.eventId === eventId)
        .map(item => item.userId);
      updateMemberSelection(userIds, [], '');
    }
  }, [detailDataFix]);
  useEffect(() => {
    if (params.eventData) {
      try {
        const parsedEvent = JSON.parse(params.eventData);
        const parsedEventTeams = JSON.parse(params.eventData) as UserEvent;
        setEventItem(parsedEvent);
        setEventItemTeams(parsedEventTeams);
      } catch (error) {
        console.error('Error parsing event data:', error);
      }
    }
  }, [params.eventData]);

  useEffect(() => {
    return () => {
      clearForm();
      clearFormEditEvent();
      clearFormEditSelectSquad();
    };
  }, []);

  const isSelected = useMemo(() => {
    if (detailDataFix && userId && eventId) {
      const value = checkInvitationsStatus(detailDataFix.event_squads, userId);
      return value;
    }
  }, [detailDataFix]);
  const count = useMemo(() => {
    if (detailDataFix && userId) {
      return countInvitationStatus(detailDataFix);
    }
  }, [detailDataFix]);

  const handleSendReminder = () => {
    const unResponseMembers = detailDataFix?.event_invitations.filter(
      item => item.invitationStatus === INVITATION_STATUS.PENDING
    );

    if (unResponseMembers?.length == 0) {
      Alert.alert('No Reminders Needs', 'All members have already response');
      return;
    }

    Alert.alert(
      'Send Reminders',
      `Send response reminders to ${unResponseMembers?.length} unresponsive member?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              logger.log('[EVENT-01] Send reminders requested', {
                eventId,
                count: unResponseMembers?.length,
              });
              const memberIds = unResponseMembers?.map(item => item.userId);

              const eventDate = formatEventDate(detailDataFix?.eventDate);
              const startTime = formatEventTime(detailDataFix?.startTime);
              const eventTitle = getEventTitle(detailDataFix);
              await Promise.all(
                memberIds!.map(item => {
                  sendEventReminder({
                    userId: item,
                    eventId: params?.eventId!,
                    eventName: getEventTitle(detailDataFix) || 'Event',
                    eventTime: `${eventDate} • ${startTime}` || 'time',
                    eventTitle: eventTitle!,
                  });
                })
              );
            } catch (error) {
              logger.error('[EVENT-01] REMINDER--DETAIL ERROR', error);
              Alert.alert(
                'Error',
                'Failed to send respon reminders. Please try again'
              );
            }
          },
        },
      ]
    );
  };

  const handleEventDropdownAction = (action: EventDropdownItem) => {
    if (user && user.app_metadata.is_super_admin !== true) return;
    setShowEventDropdown(false);

    switch (action) {
      case EVENT_ACTION.SEND_REMINDER:
        handleSendReminder();
        break;
      case EVENT_ACTION.EDIT_EVENT:
        router.push({
          pathname: Routes.EditEvent,
          params: {
            teamId: eventItem?.event.team_id || '',
            eventItem: JSON.stringify(eventItem),
            detailDataFix: JSON.stringify(detailDataFix),
            eventId: eventItem?.event_id,
          },
        });
        break;
      case EVENT_ACTION.SELECT_SQUAD:
        router.push({
          pathname: Routes.EditSelectSquad,
          params: {
            teamId: eventItem?.event.team_id || '',
            mode: SQUAD_MODE.MEMBERS,
            data: JSON.stringify(detailDataFix?.event_invitations),
            detailDataFix: JSON.stringify(detailDataFix),
            eventId: eventItem?.event_id,
            description: description,
          },
        });
        break;
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleToggleDropdown = () => {
    setShowEventDropdown(!showEventDropdown);
  };

  if (isLoading) {
    return (
      <>
        <ShScreenHeader
          title="Event Details"
          showBorder={true}
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
            onPress: handleBack,
          }}
          {...(isAdmin == true
            ? {
                rightAction: {
                  type: 'icon',
                  iconName: IconName.Edit,
                  onPress: handleToggleDropdown,
                },
              }
            : '')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colorPalette.primaryGold} />
        </View>
      </>
    );
  }
  return (
    <View style={{ flex: 1, marginBottom: insets.bottom }}>
      <ShScreenHeader
        title="Event Details"
        showBorder={true}
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
          onPress: handleBack,
        }}
        {...(isAdmin == true
          ? {
              rightAction: {
                type: 'icon',
                iconName: IconName.Edit,
                onPress: handleToggleDropdown,
              },
            }
          : '')}
      />

      {showEventDropdown && (
        <View
          style={[
            styles.dropdownPosition,
            { top: insets.top + spacing.topDropdown },
          ]}
        >
          <EventDropdown
            handleEventDropdownAction={handleEventDropdownAction}
            setShowEventDropdown={setShowEventDropdown}
          />
        </View>
      )}
      <ScrollView style={[styles.container]}>
        <View style={styles.content}>
          <EventTitleAndTeam eventItem={detailDataFix} />

          <AnswerBySection eventItem={detailDataFix} />

          {selectedUserIds.size > 0 && isSelected == 2 && (
            <>
              <EventSquadsCard eventItem={detailDataFix} />
            </>
          )}

          {selectedUserIds.size > 0 && (
            <>
              <ViewSquads
                eventItem={detailDataFix}
                selectedUserIds={selectedUserIds}
              />
            </>
          )}

          <View style={styles.descriptionSection}>
            <ShText
              variant={ShTextVariant.Subheading}
              style={styles.sectionTitle}
            >
              Description
            </ShText>
            <ShSpacer size={spacing.xsm} />
            <ShText variant={ShTextVariant.Body} style={styles.descriptionText}>
              {detailDataFix?.description || 'Description'}
            </ShText>
          </View>

          <EventDetailCard eventItem={detailDataFix} />

          <EventMap detailDataFix={detailDataFix} />

          {isSelected === 0 ? (
            // <RSVPButtons eventId={eventId} teamId={teamId} eventItem={detailDataFix} />
            <RSVPButtons
              eventId={eventId}
              teamId={teamId}
              eventItem={formatEventItem}
            />
          ) : isSelected === 1 ? (
            <View style={styles.youAreIn}>
              <ShText style={styles.youAreInText}>Not this time!</ShText>
            </View>
          ) : (
            <View style={styles.youAreIn}>
              <ShText style={styles.youAreInText}>You're in!</ShText>
            </View>
          )}

          <EventResponses
            counts={count}
            responders={detailDataFix?.event_invitations ?? []}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xxl,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colorPalette.stoneGrey,
  },
  editButton: {
    borderRadius: spacing.md,
    borderWidth: spacing.xxxs,
    padding: spacing.md,
    borderColor: colorPalette.boderButtonPrimary,
  },
  descriptionSection: {
    padding: spacing.none,
    margin: spacing.none,
  },
  sectionTitle: {
    color: colorPalette.textLight,
  },
  descriptionText: {
    color: colorPalette.stoneGrey,
  },
  dropdownPosition: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  eventDropdown: {
    position: 'absolute',
    top: spacing.md,
    left: 0,
    right: 0,
    backgroundColor: colorPalette.baseDark,
    zIndex: spacing.zIndexDropdown,
  },
  eventDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  eventDropdownItemText: {
    color: colorPalette.stoneGrey,
    paddingHorizontal: spacing.xl,
    fontSize: fontSizes.md,
  },
  mapContainer: {
    height: spacing.mapHeight,
    backgroundColor: `rgba(0, 0, 0, 0.3)`,
    borderRadius: spacing.borderRadiusMedium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    color: colorPalette.stoneGrey,
  },
  rsvpButtons: {
    flexDirection: 'row',
    gap: spacing.lg,
  },

  rsvpButtonYesActive: {
    backgroundColor: `rgba(39, 174, 96, 0.8)`,
  },
  rsvpButtonMaybeActive: {
    backgroundColor: `rgba(243, 156, 18, 0.8)`,
  },
  rsvpButtonNoActive: {
    backgroundColor: `rgba(231, 76, 60, 0.8)`,
  },
  rsvpEmoji: {
    fontSize: spacing.xl,
  },
  responsesSection: {
    gap: spacing.lg,
  },
  responsesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responsesTitle: {
    color: colorPalette.textLight,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sortText: {
    color: colorPalette.stoneGrey,
  },
  responseSummary: {
    flexDirection: 'row',
    gap: spacing.xxl,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryEmoji: {
    fontSize: spacing.lg,
  },
  summaryCount: {
    color: colorPalette.stoneGrey,
  },
  responsesList: {
    paddingVertical: spacing.xl,
  },
  responsesPlaceholder: {
    color: colorPalette.stoneGrey,
    textAlign: 'center',
  },
  listContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colorPalette.white,
  },
  subtitle: {
    color: colorPalette.stoneGrey,
    marginTop: spacing.xs,
  },
  updateButton: {
    backgroundColor: colorPalette.primary,
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMedium,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    color: colorPalette.white,
    fontSize: fontSizes.md,
  },
  youAreIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  youAreInText: {
    color: colorPalette.primaryGold,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.medium,
  },
});
