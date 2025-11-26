import { Routes } from '@con/routes';
import { router, useLocalSearchParams } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';

import {
  LocationSearchBottomSheet,
  LocationSearchResult,
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

import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { useUser } from '@hks/useUser';
import { teamsApi } from '@lib/api/teams';
import { createEvent } from '@top/features/event/api/event';
import { useEventCreateNotification } from '@top/features/event/hooks/useNotification';
import { useTeamLeadersWithTeamId } from '@top/features/event/hooks/useTeamLeadersWithTeamId';
import { useTeamMembersWithTeamId } from '@top/features/event/hooks/useTeamMembersWithTeamId';
import { UserTeam } from '@top/features/teams/types';
import { CreateEventData } from '@top/lib/api/events';
import { useEventDefaults } from '@top/lib/utils/event';
import useEventFormStore, {
  DEFAULT_EVENT_TYPE,
} from '@top/stores/eventFormStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function CreateEventScreen() {
  const { user } = useUser();
  const params = useLocalSearchParams<{
    teamId?: string;
    selectedTeam?: string;
  }>();
  const selectedTeam: UserTeam | undefined = useMemo(() => {
    if (!params?.selectedTeam) {
      return undefined;
    }
    try {
      return JSON.parse(params.selectedTeam) as UserTeam;
    } catch {
      return undefined;
    }
  }, [params?.selectedTeam]);
  const {
    formData,
    updateField,
    clearForm,
    updateInvitationMembers,
    updateInvitationLeaders,
    updateRawInvitationMembers,
    updateRawInvitationLeaders,
    updateMultipleFields,
  } = useEventFormStore();
  const { formatEventDate, formatEventTime } = useEventDefaults();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isNavigatingToSelection = useRef(false);
  const locationSheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

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

  const eventDateTime =
    formData.eventDate && formData.startTime
      ? new Date(
          `${formData.eventDate.split('T')[0]}T${formData.startTime.split('T')[1] || formData.startTime}`
        )
      : null;
  const meetTime = formData.meetTime ? new Date(formData.meetTime) : null;
  const endTime = formData.endTime ? new Date(formData.endTime) : null;
  const answerBy = formData.answerBy ? new Date(formData.answerBy) : null;

  const isMatch =
    formData.eventType === 'home_match' || formData.eventType === 'away_match';
  const isHomeMatch = formData.eventType === 'home_match';
  const isAwayMatch = formData.eventType === 'away_match';
  const isOther = formData.eventType === 'other';

  const { data: teamMembersData } = useTeamMembersWithTeamId(params.teamId);

  const { data: teamLeadersData } = useTeamLeadersWithTeamId(params.teamId);

  const {
    mutateAsync: sendEventCreateNoti,
    isPending: pendingEventCreateNoti,
  } = useEventCreateNotification();

  const fetchTeamName = useCallback(
    async (teamId: string) => {
      try {
        if (teamId === 'all') {
          return;
        }
        const team = await teamsApi.getTeam(teamId);
        if (team.clubs.name !== 'All') {
          updateField('teamName', team.clubs.name);
        }
        if (formData.eventType === 'home_match') {
          updateField('homeTeamName', team.clubs.name);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
      }
    },
    [formData.eventType, updateField]
  );

  useEffect(() => {
    clearForm();

    if (params.teamId) {
      updateField('teamId', params.teamId);
      fetchTeamName(params.teamId);
    }

    return () => {
      if (!isNavigatingToSelection.current) {
        clearForm();
      }
      isNavigatingToSelection.current = false;
    };
  }, []);

  useEffect(() => {
    if (formData.teamName && formData.teamId !== 'My Teams') {
      if (formData.eventType === 'home_match') {
        updateField('homeTeamName', formData.teamName);
        updateField('awayTeamName', '');
      } else if (formData.eventType === 'away_match') {
        updateField('awayTeamName', formData.teamName);
        updateField('homeTeamName', '');
      }
    } else {
      updateField('homeTeamName', '');
      updateField('awayTeamName', '');
    }
  }, [formData.eventType, formData.teamName, updateField, selectedTeam]);

  useEffect(() => {
    if (teamMembersData?.memberData) {
      updateInvitationMembers(teamMembersData.memberData);
      updateRawInvitationMembers(teamMembersData.memberData);
    }
  }, [teamMembersData, updateInvitationMembers, updateRawInvitationMembers]);

  useEffect(() => {
    if (teamLeadersData?.leaderData) {
      updateInvitationLeaders(teamLeadersData.leaderData);
      updateRawInvitationLeaders(teamLeadersData.leaderData);
    }
  }, [teamLeadersData, updateInvitationLeaders, updateRawInvitationLeaders]);

  const getStartsDefault = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    return tomorrow;
  }, []);

  const getMeetDefault = useCallback(() => {
    if (formData.startTime) {
      return new Date(formData.startTime);
    }
    return getStartsDefault();
  }, [formData.startTime, getStartsDefault]);

  const getAnswerByDefault = useCallback(() => {
    const baseDate = formData.startTime
      ? new Date(formData.startTime)
      : getStartsDefault();

    const answerDate = new Date(baseDate);
    answerDate.setDate(answerDate.getDate() - 3);
    answerDate.setHours(21, 0, 0, 0);

    const now = new Date();
    return answerDate > now ? answerDate : now;
  }, [formData.startTime, getStartsDefault]);

  const getEndsDefault = useCallback(() => {
    if (formData.startTime) {
      const startDate = new Date(formData.startTime);
      const startHour = startDate.getHours();

      if (startHour <= 21) {
        const endsDate = new Date(startDate);
        endsDate.setHours(startHour + 2);
        return endsDate;
      }
      return startDate;
    }
    const defaultStart = getStartsDefault();
    defaultStart.setHours(16, 0, 0, 0);
    return defaultStart;
  }, [formData.startTime, getStartsDefault]);

  const handleSend = async () => {
    if (isSubmitting) return;
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    if (!params.teamId) {
      Alert.alert('Error', 'No team selected');
      return;
    }

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const eventDate = formData.eventDate
        ? new Date(formData.eventDate)
        : null;
      const startTime = formData.startTime
        ? new Date(formData.startTime)
        : null;
      const meetTime = formData.meetTime ? new Date(formData.meetTime) : null;
      const endTime = formData.endTime ? new Date(formData.endTime) : null;
      const answerBy = formData.answerBy ? new Date(formData.answerBy) : null;

      let title = '';
      if (
        formData.eventType === 'home_match' ||
        formData.eventType === 'away_match'
      ) {
        title =
          formData.awayTeamName && formData.homeTeamName
            ? `${formData.homeTeamName} vs ${formData.awayTeamName}`
            : formData.homeTeamName || formData.awayTeamName || 'Match';
      } else if (formData.eventType === 'training') {
        title = 'Training';
      } else if (formData.eventType === 'other') {
        title = formData.eventTitle || 'Event';
      }

      let opponent = null;
      let isHomeEvent = null;
      if (formData.eventType === 'home_match') {
        opponent = formData.awayTeamName;
        isHomeEvent = true;
      } else if (formData.eventType === 'away_match') {
        opponent = formData.homeTeamName;
        isHomeEvent = false;
      }

      const eventData: CreateEventData = {
        team_id: params.teamId,
        title,
        event_type: formData.eventType || DEFAULT_EVENT_TYPE,
        event_status: 'active',
        event_date: eventDate ? eventDate.toISOString().split('T')[0] : '',
        start_time: startTime
          ? startTime.toTimeString().split(' ')[0].substring(0, 5)
          : '',
        end_time: endTime
          ? endTime.toTimeString().split(' ')[0].substring(0, 5)
          : null,
        location_name: formData.location || '',
        location_address: formData.locationAddress || null,
        location_latitude:
          formData.locationLatitude != null ? formData.locationLatitude : null,
        location_longitude:
          formData.locationLongitude != null
            ? formData.locationLongitude
            : null,
        description: formData.description || null,
        opponent,
        is_home_event: isHomeEvent,
        notes:
          [
            formData.kitColor ? `Kit Color: ${formData.kitColor}` : '',
            meetTime
              ? `Meet: ${meetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : '',
            answerBy
              ? `Answer by: ${answerBy.toLocaleDateString()} ${answerBy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : '',
          ]
            .filter(Boolean)
            .join('\n') || null,
        selected_members:
          formData.invitationMembers
            ?.filter(m => m.isChoose)
            .map(m => m.userId) || [],
        selected_leaders:
          formData.invitationLeaders
            ?.filter(l => l.isChoose)
            .map(l => l.userId) || [],
        pre_match_message: formData.preMatchMessage || null,
      };

      console.log('eventData', JSON.stringify(eventData, null, 2));
      console.log('user', user.id);

      const eventRequestId = await createEvent(eventData, user.id);
      const addMember =
        formData.invitationMembers
          ?.filter(m => m.isChoose)
          .map(m => m.userId) || [];
      const addLeader =
        formData.invitationLeaders
          ?.filter(l => l.isChoose)
          .map(l => l.userId) || [];
      const addArray = [...(addMember || []), ...(addLeader || [])];

      const eventDateFormat = formatEventDate(formData.eventDate!);
      const startTimeFormat = formatEventTime(formData.startTime!);

      await Promise.all(
        addArray.map(userId =>
          sendEventCreateNoti({
            userId,
            eventDate: eventDateFormat!,
            eventType: formData.eventTitle!,
            eventTime: startTimeFormat!,
            eventId: eventRequestId,
            eventName: title,
            eventTitle: title,
          })
        )
      );
      clearForm();

      Alert.alert('Success', 'Event created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: unknown) {
      console.error('Error creating event:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to create event';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const eventType = formData.eventType;

    // if (!formData.location?.trim()) {
    //   newErrors.location = 'Location is required';
    // }
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
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationPress = useCallback(() => {
    locationSheetRef.current?.present();
  }, []);

  const handleMembersPress = () => {
    isNavigatingToSelection.current = true;
    router.push({
      pathname: Routes.EditMembers,
      params: {
        teamId: params.teamId,
      },
    });
  };

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

  const handleLeadersPress = () => {
    isNavigatingToSelection.current = true;
    router.push({
      pathname: Routes.EditLeaders,
      params: {
        teamId: params.teamId,
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <BottomSheetModalProvider>
        <ShScreenHeader
          title="Create Event"
          showBorder={true}
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft,
            onPress: handleBack,
          }}
          rightAction={{
            type: isSubmitting ? 'loading' : 'text',
            onPress: handleSend,
            text: 'Send',
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
              marginBottom: insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={[{ marginBottom: insets.bottom }]}>
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
                  placeholder={'Home Team'}
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
                  editable={!isHomeMatch || !formData.homeTeamName}
                  error={isAwayMatch ? errors.homeTeamName : undefined}
                />
              )}

              {isMatch && (
                <ShFormFieldText
                  label="Away Team"
                  placeholder={'Away Team'}
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
                  editable={!isAwayMatch || !formData.awayTeamName}
                  error={isHomeMatch ? errors.awayTeamName : undefined}
                />
              )}

              {isOther && (
                <ShFormFieldText
                  label="Title"
                  placeholder="Enter Title"
                  value={formData.eventTitle || ''}
                  onChangeText={value => updateField('eventTitle', value)}
                  required
                  error={errors.eventTitle}
                />
              )}

              <ShFormFieldTextArea
                label="Description"
                placeholder="Enter description"
                value={formData.description || ''}
                onChangeText={value => updateField('description', value)}
                numberOfLines={4}
              />
              <ShSpacer size={spacing.xxl} />

              {isMatch && (
                <ShFormFieldText
                  label="Kit Colour"
                  placeholder="Enter kit colour"
                  value={formData.kitColor || ''}
                  onChangeText={value => updateField('kitColor', value)}
                />
              )}

              <ShFormFieldDateTime
                label="Starts"
                placeholder="Select date and time"
                value={eventDateTime}
                onChange={date => {
                  if (date) {
                    updateField('eventDate', date.toISOString());
                    updateField('startTime', date.toISOString());

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

              <ShSpacer size={spacing.xxl} />

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

              <ShFormFieldTime
                label="Ends"
                value={endTime}
                onChange={date =>
                  updateField('endTime', date?.toISOString() || null)
                }
                placeholder="Select time"
                defaultPickerValue={getEndsDefault()}
              />

              <ShFormFieldLocation
                label="Location"
                placeholder="Enter location"
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

              <ShSpacer size={spacing.xxl} />

              <ShSpacer size={spacing.tabBarHeight} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <LocationSearchBottomSheet
          ref={locationSheetRef}
          onSelect={handleLocationSelect}
          initialQuery={locationFieldValue}
        />
      </BottomSheetModalProvider>
    </>
  );
}
