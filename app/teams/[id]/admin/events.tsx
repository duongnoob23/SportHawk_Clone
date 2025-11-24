import {
  ShEmptyState,
  ShFilterDropdown,
  ShIcon,
  ShScreenContainer,
  ShScreenHeader,
  ShSpacer,
  ShTeamHeader,
  ShText,
} from '@cmp/index';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { logger } from '@lib/utils/logger';
import { EvenDetails } from '@top/features/event/types';
import { AdminEventCard } from '@top/features/teams/components/Admins/AdminEventCard';
import { useTeams } from '@top/features/teams/hooks/useTeam';
import { useTeamEvents } from '@top/features/teams/hooks/useTeamEvents';
import { TimeFilterType, useTimeFilter } from '@top/hooks/useTimeFilter';
import { Event } from '@top/lib/api/events';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TeamAdminEventsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const teamId = typeof params.id === 'string' ? params.id : undefined;
  const insets = useSafeAreaInsets();

  const {
    currentFilter,
    handleFilterChange,
    toggleDropdown,
    isDropdownOpen,
    filterOptions,
  } = useTimeFilter({
    initialFilter: 'next_30_days',
    visibleOptions: ['next_30_days', 'next_7_days', 'all', 'past'],
  });

  const currentOption = filterOptions.find(opt => opt.value === currentFilter);
  const displayLabel = currentOption?.label;

  const {
    data: events = [],
    isLoading: eventsLoading,
    isFetching: eventsFetching,
    refetch,
  } = useTeamEvents(teamId, currentFilter);

  const { data: teamData, isLoading: teamLoading } = useTeams(teamId);

  const isBusy = eventsLoading || teamLoading;

  const teamName = useMemo(() => {
    if (teamData) {
      return teamData?.clubs.name || teamData?.name || 'Team';
    }
  }, [teamData]);

  const teamDescription = useMemo(() => {
    return teamData?.teamType ?? teamData?.ageGroup ?? null;
  }, [teamData]);

  const teamLogo = useMemo(() => {
    return teamData?.clubs.clubBadgeUrl ?? null;
  }, [teamData]);

  const teamSport = useMemo(() => {
    if (teamData) {
      return teamData?.sport ?? null;
    }
  }, [teamData]);

  const buildEventPayload = useCallback(
    (event: Event): EvenDetails => ({
      id: event.id,
      event_id: event.id,
      user_id: '',
      role: '',
      attendance_status: '',
      rsvp_response: null,
      rsvp_at: null,
      invited_at: event.created_at,
      invited_by: '',
      notes: event.notes ?? '',
      created_at: event.created_at,
      updated_at: event.updated_at,
      event: {
        id: event.id,
        notes: event.notes ?? '',
        teams: {
          id: teamId || event.team_id,
          name: teamName ?? '',
          sport: teamSport ?? '',
          team_photo_url: teamLogo ?? '',
        },
        title: event.title,
        team_id: event.team_id,
        end_time: event.end_time ?? event.start_time,
        opponent: event.opponent ?? '',
        event_date: event.event_date,
        event_type: event.event_type,
        start_time: event.start_time,
        description: event.description ?? '',
        event_status: event.event_status ?? 'scheduled',
        is_home_event: Boolean(event.is_home_event),
        location_name:
          event.location_name || event.location || 'Location to be confirmed',
        location_address: event.location_address ?? null,
      },
    }),
    [teamId, teamLogo, teamName, teamSport]
  );

  const handleEditEvent = useCallback(
    (event: Event) => {
      if (!teamId) return;

      logger.log('ADM-EVT: Edit event tapped', {
        teamId,
        eventId: event.id,
      });

      const payload = buildEventPayload(event);
      router.push({
        pathname: Routes.EditEvent,
        params: {
          teamId,
          eventItem: JSON.stringify(payload),
          eventId: event.id,
        },
      });
    },
    [buildEventPayload, teamId]
  );

  const handleManageSquad = useCallback(
    (event: Event) => {
      if (!teamId) return;
      logger.log('ADM-EVT: Manage squad tapped', {
        teamId,
        eventId: event.id,
      });
      router.push({
        pathname: Routes.EditSquad,
        params: {
          teamId,
          mode: 'members',
        },
      });
    },
    [teamId]
  );

  const handleManageLeaders = useCallback(
    (event: Event) => {
      if (!teamId) return;
      logger.log('ADM-EVT: Manage leaders tapped', {
        teamId,
        eventId: event.id,
      });
      router.push({
        pathname: Routes.EditSquad,
        params: {
          teamId,
          mode: 'leaders',
        },
      });
    },
    [teamId]
  );

  const handleViewEvent = useCallback(
    (event: Event) => {
      if (!teamId) return;
      logger.log('ADM-EVT: Manage event tapped', {
        teamId,
        eventId: event.id,
      });

      const payload = buildEventPayload(event);
      router.push({
        pathname: Routes.EventDetails,
        params: {
          eventData: JSON.stringify(payload),
          eventId: event.id,
          teamId: teamId,
        },
      });
    },
    [buildEventPayload, teamId]
  );

  if (eventsLoading || teamLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colorPalette.baseDark,
          marginBottom: insets.bottom,
        }}
      >
        <ShScreenHeader
          title="Manage Events"
          leftAction={{
            type: 'icon',
            iconName: IconName.ArrowLeft,
            onPress: () => router.back(),
          }}
          showBorder={true}
        />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: insets.top,
            backgroundColor: colorPalette.baseDark,
          }}
        >
          <ActivityIndicator size="large" color={colorPalette.primaryGold} />
        </View>
      </View>
    );
  }

  return (
    <>
      <ShScreenHeader
        title="Manage Events"
        leftAction={{
          type: 'icon',
          iconName: IconName.ArrowLeft,
          onPress: () => router.back(),
        }}
        showBorder={true}
      />
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: colorPalette.baseDark,
          marginBottom: insets.bottom,
        }}
      >
        <ShScreenContainer>
          <View style={styles.content}>
            <ShSpacer size={spacing.xxl} />

            <ShTeamHeader
              teamName={teamName!}
              teamType={teamDescription ?? undefined}
              logoUrl={teamLogo}
            />

            <ShSpacer size={spacing.xxl} />

            <View style={styles.sectionHeaderRow}>
              <ShText
                variant={ShTextVariant.SectionTitle}
                style={styles.sectionTitle}
              >
                All events
              </ShText>
              <ShFilterDropdown
                currentFilter={currentFilter}
                options={filterOptions}
                onFilterChange={handleFilterChange}
                isOpen={isDropdownOpen}
                onToggle={toggleDropdown}
                testID="time-filter-dropdown"
              />
            </View>

            <ShSpacer size={spacing.xxl} />

            {isBusy && events.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color={colorPalette.primaryGold}
                />
                <ShSpacer size="md" />
                <ShText variant={ShTextVariant.Body} style={styles.loadingText}>
                  Loading events…
                </ShText>
              </View>
            ) : events.length === 0 ? (
              <ShEmptyState
                message={`No events scheduled for ${displayLabel?.toLowerCase()} yet. Create one to get started.`}
              />
            ) : (
              <View style={styles.eventList}>
                {events.map(event => (
                  <View key={event.id} style={styles.eventCardWrapper}>
                    <AdminEventCard
                      event={event}
                      onManageEvent={handleViewEvent}
                      onEditEvent={handleEditEvent}
                      onManageLeaders={handleManageLeaders}
                      onManageSquad={handleManageSquad}
                    />
                  </View>
                ))}
                {(eventsFetching || eventsLoading) && (
                  <View style={styles.listLoadingIndicator}>
                    <ActivityIndicator
                      size="small"
                      color={colorPalette.primaryGold}
                    />
                  </View>
                )}
              </View>
            )}

            <ShSpacer size="xxxl" />
          </View>
        </ShScreenContainer>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  createButtonWrapper: {
    width: '100%',
  },
  createButton: {
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.statsRowGap,
  },
  nextEventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.eventActionBannerPadding,
    backgroundColor: 'rgba(234, 189, 34, 0.08)',
    borderRadius: spacing.eventActionBannerBorderRadius,
    borderWidth: spacing.borderWidthThin,
    borderColor: 'rgba(234, 189, 34, 0.2)',
  },
  nextEventTextGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  nextEventHeading: {
    color: colorPalette.primaryGold,
  },
  nextEventBody: {
    color: colorPalette.textLight,
  },
  actionBanner: {
    backgroundColor: 'rgba(234, 189, 34, 0.1)',
    borderWidth: spacing.borderWidthThin,
    borderColor: 'rgba(234, 189, 34, 0.2)',
    borderRadius: spacing.eventActionBannerBorderRadius,
    padding: spacing.eventActionBannerPadding,
    gap: spacing.eventActionBannerGap,
  },
  actionBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBannerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBannerText: {
    color: colorPalette.primaryGold,
  },
  actionBannerCount: {
    color: colorPalette.primaryGold,
  },
  actionBannerSubtext: {
    color: 'rgba(234, 189, 34, 0.8)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  sectionTitle: {
    color: colorPalette.textLight,
    fontSize: spacing.xl,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterText: {
    color: colorPalette.stoneGrey,
  },
  filterDropdown: {
    position: 'absolute',
    top: spacing.xxxl,
    right: 0,
    backgroundColor: colorPalette.baseDark,
    borderRadius: spacing.borderRadiusMedium,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    zIndex: 1000,
    minWidth: 160,
  },
  filterDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: spacing.borderWidthThin,
    borderBottomColor: colorPalette.borderSubtle,
  },
  filterDropdownItemText: {
    color: colorPalette.textLight,
  },
  filterDropdownItemTextActive: {
    color: colorPalette.primaryGold,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.emptyStateVerticalPadding,
  },
  loadingText: {
    color: colorPalette.stoneGrey,
  },
  eventList: {
    gap: spacing.eventCardGap,
  },
  eventCardWrapper: {
    marginBottom: spacing.eventCardMarginBottom,
  },
  listLoadingIndicator: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
});
