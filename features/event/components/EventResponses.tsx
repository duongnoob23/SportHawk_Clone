import { ShAvatar, ShIcon, ShSpacer, ShText } from '@cmp/index';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { INVITATION_STATUS } from '../constants/eventResponse';
import { RSVPCounts } from '../types';
import { EventInvitationWithProfile } from '../types/event';

// Định nghĩa kiểu cho filter
type FilterValue =
  | 'most_recent'
  | 'available'
  | 'maybe'
  | 'unavailable'
  | 'unresponded';

type FilterOption = {
  label: string;
  value: FilterValue;
};

type StatusMap = {
  [key in Exclude<FilterValue, 'most_recent'>]: string;
};

type EventResponsesProps = {
  counts?: RSVPCounts;
  responders: EventInvitationWithProfile[];
};

export default function EventResponses({
  counts = { yes: 0, no: 0, maybe: 0, none: 0, total: 0, pending: 0 },
  responders = [],
}: EventResponsesProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentFilter, setCurrentFilter] =
    useState<FilterValue>('most_recent');

  const getResponseIcon = (status: string): React.ReactElement => {
    if (status === INVITATION_STATUS.ACCEPTED) return <ShText>👍🏼</ShText>;
    if (status === INVITATION_STATUS.DECLINED) return <ShText>👎🏼</ShText>;
    if (status === INVITATION_STATUS.MAYBE) return <ShText>🫳🏼</ShText>;
    if (status === INVITATION_STATUS.PENDING) return <ShText>❔</ShText>;
    return <ShText>❔</ShText>;
  };

  const handleToggle = (): void => {
    setIsOpen(prev => !prev);
  };

  const filterResponders = (
    data: EventInvitationWithProfile[],
    filter: FilterValue
  ): EventInvitationWithProfile[] => {
    const statusMap: StatusMap = {
      available: INVITATION_STATUS.ACCEPTED,
      maybe: INVITATION_STATUS.MAYBE,
      unavailable: INVITATION_STATUS.DECLINED,
      unresponded: INVITATION_STATUS.PENDING,
    };

    if (filter === 'most_recent') {
      return [...data].sort(
        (a, b) =>
          new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()
      );
    }

    const targetStatus = statusMap[filter];
    return data.filter(r => r.invitationStatus === targetStatus);
  };

  const responderFilter = useMemo<EventInvitationWithProfile[]>(() => {
    return filterResponders(responders, currentFilter);
  }, [responders, currentFilter]);

  const options: FilterOption[] = [
    { label: 'Most Recent', value: 'most_recent' },
    { label: 'Available', value: 'available' },
    { label: 'Maybe', value: 'maybe' },
    { label: 'Unavailable', value: 'unavailable' },
    { label: 'Unresponded', value: 'unresponded' },
  ];

  const handleSelectFilter = (value: FilterValue): void => {
    setCurrentFilter(value);
    setIsOpen(false);
  };

  const currentOption = options.find(opt => opt.value === currentFilter);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ShText variant={ShTextVariant.SectionTitle} style={styles.title}>
          Responses
        </ShText>
        <TouchableOpacity style={styles.dropdownButton} onPress={handleToggle}>
          <ShText variant={ShTextVariant.Body} style={styles.dropdownText}>
            {currentOption?.label}
          </ShText>
          <ShIcon
            name={IconName.ChevronDown}
            size={spacing.iconSizeSmall}
            color={colorPalette.stoneGrey}
          />
        </TouchableOpacity>
        {isOpen && (
          <View style={styles.filterDropdown}>
            {options.map((option, index) => {
              const isActive = option.value === currentFilter;
              const isLast = index === options.length - 1;

              return (
                <TouchableOpacity
                  key={String(option.value)}
                  style={[
                    styles.filterDropdownItem,
                    isLast && styles.filterDropdownItemLast,
                  ]}
                  onPress={() => handleSelectFilter(option.value)}
                  testID={`option-${String(option.value)}`}
                >
                  <ShText
                    variant={ShTextVariant.Body}
                    style={[
                      styles.filterDropdownItemText,
                      isActive && styles.filterDropdownItemTextActive,
                    ]}
                  >
                    {option.label}
                  </ShText>
                  {isActive && (
                    <ShIcon
                      name={IconName.Checkmark}
                      size={spacing.iconSizeSmall}
                      color={colorPalette.primaryGold}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
      <ShSpacer size={spacing.lg} />

      {/* Summary Counts */}
      <View style={styles.summrayRowow}>
        <View style={styles.countItem}>
          <ShText style={styles.rsvpEmoji}>👍🏼</ShText>
          <ShText variant={ShTextVariant.Body} style={styles.countText}>
            {counts.yes}
          </ShText>
        </View>

        <View style={styles.countItem}>
          <ShText style={styles.rsvpEmoji}>🫳🏼</ShText>
          <ShText variant={ShTextVariant.Body} style={styles.countText}>
            {counts.maybe}
          </ShText>
        </View>

        <View style={styles.countItem}>
          <ShText style={styles.rsvpEmoji}>👎🏼</ShText>
          <ShText variant={ShTextVariant.Body} style={styles.countText}>
            {counts.no}
          </ShText>
        </View>
      </View>
      {responderFilter.length > 0 ? (
        <View style={styles.userList}>
          {responderFilter.map(responder => {
            const fullName = responder.profiles
              ? `${responder.profiles.firstName || ''} ${responder.profiles.lastName || ''}`.trim() ||
                'User'
              : 'User';

            return (
              <TouchableOpacity
                style={styles.listContainer}
                key={responder.userId}
              >
                <View style={styles.leftContent}>
                  <View style={styles.avatarContainer}>
                    <ShAvatar
                      size={spacing.avatarSizeMedium2}
                      imageUri={responder.profiles?.profilePhotoUri || ''}
                      name={fullName}
                    />
                  </View>
                  <View style={styles.info}>
                    <ShText variant={ShTextVariant.Body} style={styles.name}>
                      {fullName}
                    </ShText>
                  </View>
                  <View>
                    <ShText>
                      {getResponseIcon(responder.invitationStatus)}
                    </ShText>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyStateContainer}>
          <ShText style={styles.emptyStateText}>
            No players found for this filter.
          </ShText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colorPalette.textLight,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dropdownText: {
    color: colorPalette.stoneGrey,
  },
  summrayRowow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.xsm,
    paddingVertical: spacing.none,
  },
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  countText: {
    color: colorPalette.textLight,
    fontWeight: '600',
  },
  userList: {
    gap: spacing.sm,
    minHeight: 300,
  },
  rsvpEmoji: {
    fontSize: spacing.lg,
  },
  listContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  filterDropdown: {
    position: 'absolute',
    top: spacing.xxxl + spacing.sm,
    right: 0,
    backgroundColor: colorPalette.baseDark,
    borderRadius: spacing.borderRadiusMedium,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    zIndex: 1000,
    minWidth: 150,
    shadowColor: colorPalette.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  filterDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: spacing.borderWidthThin,
    borderBottomColor: colorPalette.borderSubtle,
  },
  filterDropdownItemLast: {
    borderBottomWidth: 0,
  },
  filterDropdownItemText: {
    color: colorPalette.textLight,
  },
  filterDropdownItemTextActive: {
    color: colorPalette.primaryGold,
    fontWeight: '600',
  },
  emptyStateContainer: {
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: spacing.lgx,
  },
});
