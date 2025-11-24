import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { fontSizes, ShTextVariant } from '@con/typography';
import { ShIcon, ShText } from '@top/components';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { EventDropdownItem, EventDropdownOption } from '../types';

type EventDropdownProps = {
  handleEventDropdownAction: (item: EventDropdownItem) => void;
  setShowEventDropdown: (item: boolean) => void;
};

const EventDropdown = ({
  handleEventDropdownAction,
  setShowEventDropdown,
}: EventDropdownProps) => {
  const eventDropdownMap: Record<EventDropdownItem, EventDropdownOption> = {
    send_reminder: { name: 'Send reminder', value: IconName.Bell },
    edit_event: { name: 'Edit Event', value: IconName.EditPen },
    select_squad: { name: 'Select Squad', value: IconName.Team },
  };

  const getEventDropdownItem = (item: EventDropdownItem): EventDropdownOption =>
    eventDropdownMap[item];

  return (
    <View style={[StyleSheet.absoluteFill]}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setShowEventDropdown(false)}
      />
      <View style={styles.eventDropdown}>
        {(
          ['send_reminder', 'edit_event', 'select_squad'] as EventDropdownItem[]
        ).map(item => (
          <TouchableOpacity
            onPress={() => handleEventDropdownAction(item)}
            key={item}
            style={styles.eventDropdownItem}
          >
            <ShIcon
              name={getEventDropdownItem(item).value}
              size={spacing.iconSizeSmall}
              color={colorPalette.stoneGrey}
            />
            <ShText
              variant={ShTextVariant.Body}
              style={[styles.eventDropdownItemText]}
            >
              {getEventDropdownItem(item).name}
            </ShText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  eventDropdown: {
    position: 'absolute',
    top: spacing.none,
    left: 0,
    right: 0,
    backgroundColor: colorPalette.baseDark,
    zIndex: spacing.zIndexDropdown,
    borderWidth: 0.5,
    borderBottomColor: colorPalette.borderDropdown,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: spacing.zIndexDropdown - 1,
  },
});

export default EventDropdown;
