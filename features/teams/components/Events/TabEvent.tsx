import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShFilterDropdown, ShIcon, ShSpacer } from '@top/components';
import { ShText } from '@top/components/ShText';
import { EventInvitation } from '@top/features/event/types/event';
import { useTimeFilter } from '@top/hooks/useTimeFilter';
import { useUser } from '@top/hooks/useUser';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserEvents } from '../../hooks/useUserEvents';
import { UserTeam } from '../../types';
import ActionRequiredBanner from './ActionRequiredBanner';
import EventsList from './EventsList';

type TabEventProps = {
  selectedTeam: UserTeam;
};

const TabEvent = ({ selectedTeam }: TabEventProps) => {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const {
    currentFilter,
    handleFilterChange,
    toggleDropdown,
    isDropdownOpen,
    filterOptions,
  } = useTimeFilter({
    initialFilter: 'next_30_days',
    visibleOptions: ['next_30_days', 'next_7_days', 'all'],
  });

  const handleNavigate = (eventItem: EventInvitation) => {
    if (eventItem) {
      router.push({
        pathname: Routes.EventDetails,
        params: {
          eventData: JSON.stringify(eventItem),
          eventId: eventItem.event_id,
          teamId: eventItem.event.team_id,
        },
      });
    }
  };

  const {
    data: eventsData,
    isLoading: eventsLoading,
    refetch: refetchEventData,
  } = useUserEvents(selectedTeam?.id, user?.id, currentFilter);

  const displayBanner = useMemo(() => {
    if (!eventsData) return 0;

    return eventsData.reduce((count, item) => {
      if (item.invitation_status === 'pending' && item.hasSquad === false) {
        count++;
      }
      return count;
    }, 0);
  }, [eventsData]);

  return (
    <ScrollView
      style={styles.eventsContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: insets.bottom }}>
        {displayBanner > 0 && (
          <ActionRequiredBanner actionRequiredCount={displayBanner} />
        )}
        <ShSpacer size={spacing.md} />

        <View style={[styles.eventsHeader]}>
          <ShText variant={ShTextVariant.Subheading} style={styles.eventsTitle}>
            Upcoming Events
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

        <ShSpacer size={spacing.xl} />

        {eventsLoading ? (
          <View style={styles.loadingContainer}>
            <ShText variant={ShTextVariant.Body} style={styles.loadingText}>
              Loading events...
            </ShText>
          </View>
        ) : eventsData && eventsData.length > 0 ? (
          <EventsList
            events={eventsData}
            onNavigate={handleNavigate}
            eventFilter={currentFilter}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={styles.emptyTabContent}>
              <ShIcon
                name={IconName.Calendar}
                size={spacing.iconSizeXLarge}
                color={colorPalette.primaryGold}
              />
              <ShSpacer size={spacing.lg} />
              <ShText
                variant={ShTextVariant.Subheading}
                style={styles.centerText}
              >
                You don’t have any events
              </ShText>
              <ShSpacer size={spacing.md} />
              <ShText variant={ShTextVariant.Body} style={styles.centerText}>
                There aren’t any upcoming
              </ShText>
              <ShText variant={ShTextVariant.Body} style={styles.centerText}>
                events at the moment
              </ShText>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  eventsContainer: {
    flex: 1,
  },
  actionBanner: {
    backgroundColor: `rgba(234, 189, 34, 0.1)`,
    borderWidth: spacing.borderWidthThin,
    borderColor: `rgba(234, 189, 34, 0.2)`,
    borderRadius: spacing.eventActionBannerBorderRadius,
    padding: spacing.eventActionBannerPadding,
    marginBottom: spacing.xxl,
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
    color: `rgba(234, 189, 34, 0.8)`,
    marginTop: spacing.xs,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: spacing.lg,
  },
  eventsTitle: {
    color: colorPalette.textLight,
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
    zIndex: spacing.zIndexDropdown,
    minWidth: 150,
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
    paddingVertical: spacing.emptyStateVerticalPadding,
    alignItems: 'center',
  },
  loadingText: {
    color: colorPalette.stoneGrey,
  },
  emptyTabContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.emptyStateVerticalPadding,
  },
  centerText: {
    textAlign: 'center',
  },
});

export default TabEvent;
