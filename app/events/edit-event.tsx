import { Routes } from '@con/routes';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  LocationSearchBottomSheet,
  type LocationSearchResult,
  ShButton,
  ShFormFieldDateTime,
  ShFormFieldEventType,
  ShFormFieldLocation,
  ShFormFieldText,
  ShFormFieldTextArea,
  ShFormFieldTime,
  ShNavItem,
  ShScreenHeader,
  ShSpacer,
  ShText,
} from '@cmp/index';

import { colorPalette } from '@con/colors';
import { EVENT_TYPES } from '@con/eventTypes';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { useUser } from '@hks/useUser';
import { EVENT_TYPE } from '@top/features/event/constants/eventResponse';
import { useDeleteAllEventSquad } from '@top/features/event/hooks/useDeleteAllEventSquad';
import { useDeleteEvent } from '@top/features/event/hooks/useDeleteEvent';
import { useEventEdit } from '@top/features/event/hooks/useEventEdit';
import {
  useEventEditCancelNotification,
  useEventEditUpdateNotification,
} from '@top/features/event/hooks/useNotification';
import { useTeamAdminsSimple } from '@top/features/event/hooks/useTeamAdminsSimple';
import { useTeamMembersSimple } from '@top/features/event/hooks/useTeamMembersSimple';
import { useUpdateEventById } from '@top/features/event/hooks/useUpdateEventById';
import {
  EditEventType,
  EvenDetails,
  EventDetailData,
} from '@top/features/event/types';
import {
  getEventTitle,
  parseAnswerBy,
  parseEventNotes,
} from '@top/features/event/utils';
import { useTeam } from '@top/features/teams/hooks/useTeam';
import { useEventDefaults } from '@top/lib/utils/event';
import { logger } from '@top/lib/utils/logger';
import useEventFormStore, {
  DEFAULT_EVENT_TYPE,
} from '@top/stores/eventFormStore';

export default function EditEventScreen() {
  const { user } = useUser();
  const params = useLocalSearchParams<{
    teamId: string;
    eventItem: string;
    eventId: string;
    detailDataFix: string;
  }>();
  const eventDetailData = useMemo(() => {
    if (!params.detailDataFix) return null;

    try {
      return JSON.parse(params.detailDataFix) as EventDetailData;
    } catch (e) {
      logger.warn('[EditEvent] invalid detailDataFix', e);
      return null;
    }
  }, [params.detailDataFix]);

  const insets = useSafeAreaInsets();
  const [eventItem, setEventItem] = useState<EditEventType | null>(null);

  const locationSheetRef = useRef<BottomSheetModal>(null);
  const {
    formData,
    updateField,
    updateMultipleFields,
    updateInvitationLeaders,
    updateInvitationMembers,
    updateRawInvitationLeaders,
    updateRawInvitationMembers,
    clearForm,
  } = useEventFormStore();
  const {
    getStartsDefault,
    getMeetDefault,
    getAnswerByDefault,
    getEndsDefault,
  } = useEventDefaults();
  const { formatEventDate, formatEventTime } = useEventDefaults();

  const { data: getEventEdit, isLoading: loadingEventEdit } = useEventEdit(
    params.eventId
  );

  const { data: editLeaderData } = useTeamAdminsSimple(
    params.teamId,
    eventItem?.id
  );

  const { data: editMemberdata } = useTeamMembersSimple({
    teamId: params.teamId,
    eventId: eventItem?.id,
  });

  const { data: team, isLoading, error } = useTeam(params.teamId);

  const { mutateAsync: editEventData, isPending: eventDataPending } =
    useUpdateEventById();
  const { mutateAsync: deleteEvent, isPending: deleteEventPending } =
    useDeleteEvent();

  const {
    mutateAsync: sendEditEventUpdateNoti,
    isPending: pendingEditEventUpdateNoti,
  } = useEventEditUpdateNotification();
  const {
    mutateAsync: sendEditEventCancelNoti,
    isPending: pendingEditEventCancelNoti,
  } = useEventEditCancelNotification();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isNavigatingToSelection = useRef(false);

  const eventDateTime = useMemo(() => {
    if (!formData.eventDate || !formData.startTime) return null;
    const date = `${formData.eventDate.split('T')[0]}T${
      formData.startTime.split('T')[1] || formData.startTime
    }`;
    return new Date(date);
  }, [formData.eventDate, formData.startTime]);

  const meetTime = formData.meetTime ? new Date(formData.meetTime) : null;
  const endTime = formData.endTime ? new Date(formData.endTime) : null;
  const answerBy = formData.answerBy ? new Date(formData.answerBy) : null;

  const isMatch =
    formData.eventType === 'home_match' || formData.eventType === 'away_match';
  const isHomeMatch = formData.eventType === 'home_match';
  const isAwayMatch = formData.eventType === 'away_match';
  const isOther = formData.eventType === 'other';

  const locationFieldValue =
    formData.location || formData.locationAddress || '';

  const locationHelperText =
    formData.locationAddress && formData.locationAddress !== locationFieldValue
      ? formData.locationAddress
      : undefined;

  const locationCoordinates =
    formData.locationLatitude != null && formData.locationLongitude != null
      ? {
          latitude: formData.locationLatitude,
          longitude: formData.locationLongitude,
        }
      : null;

  const [loading, setLoading] = useState(false);

  const {
    mutateAsync: deleteAllEventSquad,
    isPending: deleteAllEventSquadPending,
  } = useDeleteAllEventSquad();

  useEffect(() => {
    clearForm();

    if (getEventEdit?.editEventData) {
      setEventItem(getEventEdit.editEventData);
    }
  }, [getEventEdit]);

  useEffect(() => {
    if (editLeaderData?.leaderData) {
      updateInvitationLeaders(editLeaderData.leaderData);
      updateRawInvitationLeaders(editLeaderData.leaderData);
    }
  }, [editLeaderData]);

  useEffect(() => {
    if (editMemberdata?.memberData) {
      updateInvitationMembers(editMemberdata.memberData);
      updateRawInvitationMembers(editMemberdata.memberData);
    }
  }, [editMemberdata]);

  useEffect(() => {
    clearForm();
    if (getEventEdit?.editEventData) {
      const freshEventData = getEventEdit.editEventData;
      const result = parseEventNotes(freshEventData?.notes);

      updateMultipleFields({
        eventType: freshEventData?.eventType || '',
        homeTeamName: '',
        awayTeamName: freshEventData?.opponent || '',
        description: freshEventData?.description || '',
        kitColor: result.kitColor || '',
        location: freshEventData?.locationName || '',
        locationAddress: freshEventData?.locationAddress || '',
        locationLatitude: freshEventData?.locationLatitude ?? null,
        locationLongitude: freshEventData?.locationLongitude ?? null,
        eventDate: freshEventData?.eventDate
          ? new Date(freshEventData?.eventDate).toISOString()
          : null,
        startTime: freshEventData?.startTime
          ? new Date(
              `${freshEventData?.eventDate}T${freshEventData?.startTime}`
            ).toISOString()
          : null,
        meetTime: result?.meetTime
          ? new Date(
              `${freshEventData?.eventDate}T${result.meetTime}`
            ).toISOString()
          : null,
        endTime: freshEventData?.endTime
          ? new Date(
              `${freshEventData?.eventDate}T${freshEventData?.endTime}`
            ).toISOString()
          : null,
        answerBy: result?.answerBy ? parseAnswerBy(result.answerBy) : null,
        teamId: freshEventData?.teamId || '',
        teamName: eventDetailData?.teams?.name ?? '',
      });
    } else if (params.eventItem) {
      const eventItem: EvenDetails = JSON.parse(params.eventItem);
      const result = parseEventNotes(eventItem?.event.notes);
      if (eventItem) {
        updateMultipleFields({
          eventType: eventItem?.event.event_type || '',
          homeTeamName: '',
          awayTeamName: '',
          description: eventItem?.event.description || '',
          kitColor: result.kitColor || '',
          location: eventItem?.event.location_name || '',
          locationAddress: eventItem?.event.location_address || '',
          locationLatitude: eventItem?.event.location_latitude ?? null,
          locationLongitude: eventItem?.event.location_longitude ?? null,
          eventDate: eventItem?.event.event_date
            ? new Date(eventItem?.event.event_date).toISOString()
            : null,
          startTime: eventItem?.event.start_time
            ? new Date(
                `${eventItem?.event.event_date}T${eventItem?.event.start_time}`
              ).toISOString()
            : null,
          meetTime: result?.meetTime
            ? new Date(
                `${eventItem?.event.event_date}T${result.meetTime}`
              ).toISOString()
            : null,
          endTime: eventItem?.event.end_time
            ? new Date(
                `${eventItem?.event.event_date}T${eventItem?.event.end_time}`
              ).toISOString()
            : null,
          answerBy: result?.answerBy ? parseAnswerBy(result.answerBy) : null,
          teamId: eventItem?.event.team_id || '',
          teamName: eventItem?.event.teams.name || '',
        });
      }
    }
  }, [getEventEdit, params.eventItem, updateMultipleFields]);

  const handleLocationPress = useCallback(() => {
    locationSheetRef.current?.present();
  }, []);

  const handleLocationSelect = useCallback(
    (result: LocationSearchResult) => {
      updateMultipleFields({
        location: result.name,
        locationAddress: result.address,
        locationLatitude: result.latitude,
        locationLongitude: result.longitude,
      });

      setErrors(prev => {
        if (!prev.location) {
          return prev;
        }
        const { location, ...rest } = prev;
        return rest;
      });
    },
    [updateMultipleFields]
  );

  useEffect(() => {
    if (team && formData.eventType) {
      updateField('teamName', team.name);
      if (formData.eventType === 'home_match') {
        updateField('homeTeamName', team.name);
        updateField('awayTeamName', formData.awayTeamName || '');
      } else if (formData.eventType === 'away_match') {
        updateField('awayTeamName', team.name);
        updateField('homeTeamName', formData.homeTeamName || '');
      }
    }
  }, [team, formData.eventType, updateField]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const eventType = formData.eventType;

    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }
    if (
      !formData.invitationMembers ||
      formData.invitationMembers.length === 0
    ) {
      newErrors.members = 'Please select at least one team member';
    }
    if (
      !formData.invitationLeaders ||
      formData.invitationLeaders.length === 0
    ) {
      newErrors.members = 'Please select at least one team member';
    }
    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.meetTime) {
      newErrors.meetTime = 'Meet time is required';
    }
    if (!formData.answerBy) {
      newErrors.answerBy = 'Answer by date/time is required';
    }

    if (eventType === 'home_match') {
      if (!formData.awayTeamName?.trim()) {
        newErrors.awayTeamName = 'Away team name is required';
      }
    } else if (eventType === 'away_match') {
      if (!formData.homeTeamName?.trim()) {
        newErrors.homeTeamName = 'Home team name is required';
      }
    } else if (eventType === 'other') {
      if (!formData.eventTitle?.trim()) {
        newErrors.eventTitle = 'Event title is required';
      }
    }

    setErrors(newErrors);
    console.log(Object.keys(newErrors).length);
    return Object.keys(newErrors).length === 0;
  };

  const handleMembersPress = () => {
    isNavigatingToSelection.current = true;
    router.push({
      pathname: Routes.EditMembers,
      params: {
        teamId: params.teamId,
        eventId: eventItem?.id,
      },
    });
  };

  const handleLeadersPress = () => {
    isNavigatingToSelection.current = true;
    router.push({
      pathname: Routes.EditLeaders,
      params: {
        teamId: params.teamId,
        eventId: eventItem?.id,
      },
    });
  };

  const handleEventCanel = async () => {
    Alert.alert('Cancel Event', 'Are you sure you want to cancel this Event?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => {
          Alert.prompt(
            'Cancellation Reason',
            'Please provide a reason for cancelling:',
            async reason => {
              if (reason) {
                try {
                  const userId = user?.id;

                  await deleteEvent({
                    eventId: eventItem?.id,
                    reason,
                    userId,
                  });

                  Alert.alert(
                    'Event Cancelled',
                    'Event has been cancelled successfully.'
                  );

                  router.back();
                } catch (error) {
                  console.error('Cancel event error', error);
                  Alert.alert(
                    'Error',
                    'Failed to cancel Event. Please try again.'
                  );
                }
              }
            }
          );
        },
      },
    ]);
  };

  const handleDeleteEvent = async () => {
    const reason = 'Cancel Event';
    const userId = user?.id;
    const eventId = eventItem?.id;
    if (!user || !eventId || !reason) {
      Alert.alert('Error', 'Missing required parameters');
      return;
    }

    try {
      const addMember = formData?.invitationMembers
        ?.filter(item => {
          const raw = formData?.rawInvitationMembers?.find(
            r => r.userId === item.userId
          );
          return item.isChoose === true && raw?.isChoose === false;
        })
        .map(item => item.userId);

      const addLeader = formData?.invitationLeaders
        ?.filter(item => {
          const raw = formData?.rawInvitationLeaders?.find(
            r => r.userId === item.userId
          );
          return item.isChoose === true && raw?.isChoose === false;
        })
        .map(item => item.userId);
      const addMemberNoti = formData?.invitationMembers
        ?.filter(item => {
          const raw = formData?.rawInvitationMembers?.find(
            r => r.userId === item.userId
          );
          return item.isChoose === true && raw?.isChoose === true;
        })
        .map(item => item.userId);

      const addLeaderNoti = formData?.invitationLeaders
        ?.filter(item => {
          const raw = formData?.rawInvitationLeaders?.find(
            r => r.userId === item.userId
          );
          return item.isChoose === true && raw?.isChoose === true;
        })
        .map(item => item.userId);

      const addArray = [...(addMember || []), ...(addLeader || [])];
      const addArrayNoti = [...(addMemberNoti || []), ...(addLeaderNoti || [])];
      const membersNotiArray = [...(addArray || []), ...(addArrayNoti || [])];

      await deleteEvent({
        eventId,
        reason,
        userId,
      });
      const eventDetailData = JSON.parse(
        params.detailDataFix
      ) as EventDetailData;
      const eventName = getEventTitle(eventDetailData);
      const cancellationReason = 'Cancel Event';
      const eventDate = formatEventDate(eventItem?.eventDate);
      // const eventTitle = eventItem.title;
      const eventTitle =
        eventItem.eventType == EVENT_TYPE.TRAINING
          ? 'Training'
          : eventItem.eventType == EVENT_TYPE.OTHER
            ? 'Other'
            : eventItem.title;
      try {
        await Promise.all(
          membersNotiArray.map(item => {
            sendEditEventCancelNoti({
              userId: item,
              eventName,
              cancellationReason,
              eventDate,
              eventId,
              eventTitle: eventTitle!,
            });
          })
        );
        logger.log('[EVT-DEL] Notifications sent to all members');
      } catch (notiError) {
        logger.warn('[EVT-DEL] Some notifications failed:', notiError);
      }

      router.back();
    } catch (error) {
      console.error('Error on delete event', error);
    }
  };

  const handleSend = async () => {
    if (!eventItem) {
      Alert.alert('Error', 'Missing eventItem');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }
    const eventId = eventItem?.id;
    const addMember = formData?.invitationMembers
      ?.filter(item => {
        const raw = formData?.rawInvitationMembers?.find(
          r => r.userId === item.userId
        );
        return item.isChoose === true && raw?.isChoose === false;
      })
      .map(item => item.userId);

    const addLeader = formData?.invitationLeaders
      ?.filter(item => {
        const raw = formData?.rawInvitationLeaders?.find(
          r => r.userId === item.userId
        );
        return item.isChoose === true && raw?.isChoose === false;
      })
      .map(item => item.userId);
    const addMemberNoti = formData?.invitationMembers
      ?.filter(item => {
        const raw = formData?.rawInvitationMembers?.find(
          r => r.userId === item.userId
        );
        return item.isChoose === true && raw?.isChoose === true;
      })
      .map(item => item.userId);

    const addLeaderNoti = formData?.invitationLeaders
      ?.filter(item => {
        const raw = formData?.rawInvitationLeaders?.find(
          r => r.userId === item.userId
        );
        return item.isChoose === true && raw?.isChoose === true;
      })
      .map(item => item.userId);

    const removeMember = formData?.invitationMembers
      ?.filter(item => {
        const raw = formData?.rawInvitationMembers?.find(
          r => r.userId === item.userId
        );
        return item.isChoose === false && raw?.isChoose === true;
      })
      .map(item => item.userId);

    const removeLeader = formData?.invitationLeaders
      ?.filter(item => {
        const raw = formData?.rawInvitationLeaders?.find(
          r => r.userId === item.userId
        );
        return item.isChoose === false && raw?.isChoose === true;
      })
      .map(item => item.userId);

    // Thông báo cho người dùng true -> true tức là không thay đổi, và false -> người dùng mới , code mình đọc mãi mới hiểu :))
    const addArray = [...(addMember || []), ...(addLeader || [])];
    const addArrayNoti = [...(addMemberNoti || []), ...(addLeaderNoti || [])];
    const membersNotiArray = [...(addArray || []), ...(addArrayNoti || [])];
    const removeArray = [...(removeMember || []), ...(removeLeader || [])];
    const adminId = user.id;

    try {
      setLoading(true);
      await editEventData({
        adminId,
        eventId,
        formData,
        addArray,
        removeArray,
        teamId: params.teamId,
      });
      const userId = user.id;
      const teamId = params.teamId;
      if (eventId && userId && teamId) {
        await deleteAllEventSquad({ eventId, userId, teamId });
      }

      const eventDetailData = JSON.parse(
        params.detailDataFix
      ) as EventDetailData;
      const eventName = getEventTitle(eventDetailData);
      const updateReason = 'Reason';
      const eventDate = formatEventDate(eventItem?.eventDate);
      const startTime = formatEventTime(eventItem?.startTime ?? undefined);
      const eventTitle =
        eventItem.eventType == EVENT_TYPE.TRAINING
          ? 'Training'
          : eventItem.eventType == EVENT_TYPE.OTHER
            ? 'Other'
            : eventItem.title;

      membersNotiArray.map(item => {
        sendEditEventUpdateNoti({
          userId: item,
          eventName: eventName,
          updateReason: updateReason,
          eventDate: eventDate,
          eventTime: startTime,
          eventTitle: eventTitle!,
          eventId: eventId,
        });
      });

      setLoading(false);
      console.log('✅ Event updated and squads deleted successfully');
      router.back();
    } catch (error) {
      console.error('❌ Error while updating or deleting squad:', error);
      Alert.alert('Error', 'Failed to update event or delete squads.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <>
        <ShScreenHeader
          title="Edit Event"
          showBorder={true}
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft,
            onPress: handleBack,
          }}
          rightAction={{
            type: 'text',
            onPress: handleSend,
            text: 'Save',
            textColor: colorPalette.primaryGold,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colorPalette.primaryGold} />
          <ShText>...Saving new event data</ShText>
        </View>
      </>
    );
  }

  return (
    <BottomSheetModalProvider>
      <View
        style={{
          flex: 1,
          marginBottom: insets.bottom,
        }}
      >
        <ShScreenHeader
          title="Edit Event"
          showBorder={true}
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft, // hoặc tên icon trong hệ thống của bạn
            onPress: handleBack,
          }}
          rightAction={{
            type: 'text',
            onPress: handleSend,
            text: 'Save',
            textColor: colorPalette.primaryGold,
          }}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: colorPalette.baseDark }}
        >
          <ScrollView
            contentContainerStyle={{
              padding: spacing.xxl,
              paddingVertical: 0,
            }}
            showsVerticalScrollIndicator={false}
          >
            <ShSpacer size={spacing.xxl} />
            {/* Event Type Selector - Always shown */}
            <ShFormFieldEventType
              value={formData.eventType || DEFAULT_EVENT_TYPE}
              onChange={value => updateField('eventType', value)}
              options={EVENT_TYPES}
              required
              editable={true}
            />

            {isMatch && (
              <ShFormFieldText
                label="Home Team"
                placeholder={!isHomeMatch ? '' : 'Home Team'}
                value={
                  isHomeMatch
                    ? formData.teamName || ''
                    : formData.homeTeamName || ''
                }
                onChangeText={
                  isHomeMatch
                    ? () => {}
                    : value => updateField('homeTeamName', value)
                }
                required
                editable={!isHomeMatch}
                error={isAwayMatch ? errors.homeTeamName : undefined}
              />
            )}

            {/* Away Team - Show for matches only */}
            {isMatch && (
              <ShFormFieldText
                label="Away Team"
                placeholder={isAwayMatch ? '' : 'Away Team'}
                value={
                  isAwayMatch
                    ? formData.teamName || ''
                    : formData.awayTeamName || ''
                }
                onChangeText={
                  isAwayMatch
                    ? () => {}
                    : value => updateField('awayTeamName', value)
                }
                required
                editable={!isAwayMatch}
                error={isHomeMatch ? errors.awayTeamName : undefined}
              />
            )}

            {/* Title - Show for Other event type only */}
            {isOther && (
              <ShFormFieldText
                label="Title"
                placeholder="Give the event a Title"
                value={formData.eventTitle || ''}
                onChangeText={value => updateField('eventTitle', value)}
                required
                error={errors.eventTitle}
              />
            )}

            {/* Description - Always shown */}
            <ShFormFieldTextArea
              label="Description"
              placeholder="Enter description"
              value={formData.description || ''}
              onChangeText={value => updateField('description', value)}
              numberOfLines={4}
            />

            {/* Kit Colour - Show for matches only */}
            <ShSpacer size={spacing.xxl} />
            {isMatch && (
              <ShFormFieldText
                label="Kit Colour"
                placeholder="Enter kit colour"
                value={formData.kitColor || ''}
                onChangeText={value => updateField('kitColor', value)}
              />
            )}

            {/* Starts - Always shown with combined date/time */}
            <ShFormFieldDateTime
              label="Starts"
              placeholder="Select date and time"
              value={eventDateTime}
              onChange={date => {
                if (date) {
                  updateField('eventDate', date.toISOString());
                  updateField('startTime', date.toISOString());

                  // Auto-populate Meet and Answer By if they're currently blank
                  if (!formData.meetTime) {
                    updateField('meetTime', date.toISOString());
                  }
                  if (!formData.answerBy) {
                    const answerDate = new Date(date);
                    answerDate.setDate(answerDate.getDate() - 3);
                    answerDate.setHours(21, 0, 0, 0);
                    const now = new Date();
                    updateField(
                      'answerBy',
                      (answerDate > now ? answerDate : now).toISOString()
                    );
                  }
                }
              }}
              defaultPickerValue={getStartsDefault()}
              required
              error={errors.eventDate || errors.startTime}
            />

            <ShSpacer size={spacing.xxl}></ShSpacer>
            {/* Meet - Always shown */}
            <ShFormFieldTime
              label="Meet"
              value={meetTime}
              onChange={date =>
                updateField('meetTime', date?.toISOString() || null)
              }
              placeholder="Select time"
              defaultPickerValue={getMeetDefault()}
              required
              error={errors.meetTime}
            />

            {/* Ends - Always shown */}
            <ShFormFieldTime
              label="Ends"
              value={endTime}
              onChange={date =>
                updateField('endTime', date?.toISOString() || null)
              }
              placeholder="Select time"
              defaultPickerValue={getEndsDefault()}
            />

            {/* Location - Always shown */}
            <ShFormFieldLocation
              label="Location"
              placeholder="Search for a location"
              value={locationFieldValue}
              onChangeText={value =>
                updateMultipleFields({
                  location: value,
                  locationAddress: '',
                  locationLatitude: null,
                  locationLongitude: null,
                })
              }
              required
              error={errors.location}
              showMapPreview={true}
              onPress={handleLocationPress}
              coordinates={locationCoordinates}
              helperText={locationHelperText}
            />

            {/* Answer by - Always shown */}
            <ShFormFieldDateTime
              label="Answer by"
              value={answerBy}
              onChange={date =>
                updateField('answerBy', date?.toISOString() || null)
              }
              placeholder="Select date and time"
              defaultPickerValue={getAnswerByDefault()}
              required
              error={errors.answerBy}
            />

            {/* Members error message */}
            {errors.members && (
              <ShText
                variant={ShTextVariant.Small}
                style={{
                  color: colorPalette.primaryGold,
                  marginBottom: spacing.xs,
                }}
              >
                {errors.members}
              </ShText>
            )}

            <ShSpacer size={spacing.xxl}></ShSpacer>
            {/* Members selector - Always shown */}
            <ShNavItem
              label={`Members ${formData.invitationMembers && formData.invitationMembers.filter(m => m.isChoose).length > 0 ? `(${formData.invitationMembers.filter(m => m.isChoose).length})` : '(0)'}`}
              subtitle={
                formData.invitationMembers &&
                formData.invitationMembers.filter(m => m.isChoose).length > 0
                  ? `${formData.invitationMembers.filter(m => m.isChoose).length} selected`
                  : 'All team members '
              }
              onPress={handleMembersPress}
              required
              showDropdownIcon
            />

            <ShSpacer size={spacing.xxl} />

            {/* Leaders selector - Always shown */}
            <ShNavItem
              label={`Leaders ${formData.invitationLeaders && formData.invitationLeaders.filter(l => l.isChoose).length > 0 ? `(${formData.invitationLeaders.filter(l => l.isChoose).length})` : '(0)'}`}
              subtitle={
                formData.invitationLeaders &&
                formData.invitationLeaders.filter(l => l.isChoose).length > 0
                  ? `${formData.invitationLeaders.filter(l => l.isChoose).length} selected`
                  : 'Head coach'
              }
              onPress={handleLeadersPress}
              required
              showDropdownIcon
            />

            <ShSpacer size={spacing.adminButtonTextTop} />

            <ShButton
              onPress={handleDeleteEvent}
              title="Cancel Event"
              variant={'secondary'}
              style={styles.buttonCancelEvent}
              textStyle={styles.buttonCancelEventText}
            />

            <ShSpacer size={spacing.adminButtonTextTop} />
          </ScrollView>
        </KeyboardAvoidingView>
        <LocationSearchBottomSheet
          ref={locationSheetRef}
          onSelect={handleLocationSelect}
          initialQuery={locationFieldValue}
        />
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  buttonCancelEvent: {
    backgroundColor: colorPalette.errorBlack,
    borderColor: colorPalette.errorBlack,
  },
  buttonCancelEventText: {
    color: colorPalette.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
