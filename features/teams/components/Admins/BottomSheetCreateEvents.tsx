import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShIcon, ShSpacer, ShText } from '@top/components';
import { UserTeam } from '../../types';

interface BottomSheetCreateEventsProps {
  selectedTeam: UserTeam | null;
}

const BottomSheetCreateEvents = forwardRef<
  BottomSheetModal,
  BottomSheetCreateEventsProps
>(({ selectedTeam }, ref) => {
  const router = useRouter();
  const snapPoints = useMemo(() => ['40%', '75%'], []);

  const handleNavigateToEvent = () => {
    (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
    router.push(
      selectedTeam?.id
        ? {
            pathname: Routes.CreateEvent,
            params: {
              teamId: selectedTeam.id,
              selectedTeam: JSON.stringify(selectedTeam),
            },
          }
        : { pathname: Routes.CreateEvent }
    );
  };

  const handleNavigateToPayment = () => {
    (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
    router.push(
      selectedTeam?.id
        ? {
            pathname: Routes.PaymentCreate,
            params: {
              teamId: selectedTeam.id,
              selectedTeam: JSON.stringify(selectedTeam),
            },
          }
        : { pathname: Routes.PaymentCreate }
    );
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      backgroundStyle={{ backgroundColor: colorPalette.baseDark }}
      handleIndicatorStyle={{ backgroundColor: colorPalette.stoneGrey }}
      containerStyle={{ zIndex: 1000, elevation: 1000 }}
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          //   pressBehavior="close"
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetView style={styles.sheetContainer}>
        <ShSpacer size={spacing.xxl} />
        <View style={styles.modalHeader}>
          <ShText
            variant={ShTextVariant.SectionTitle}
            style={styles.modalTitle}
          >
            Create New
          </ShText>
        </View>
        <ShSpacer size={spacing.xxl} />

        <View style={styles.modalContent}>
          {/* Create Event */}
          <TouchableOpacity
            style={styles.modalItem}
            onPress={handleNavigateToEvent}
          >
            <View style={styles.modalItemIconContainer}>
              <ShIcon
                name={IconName.CalendarOutline}
                size={spacing.iconSizeSmall}
                color={colorPalette.primaryGold}
              />
            </View>
            <View style={styles.modalItemTextContainer}>
              <ShText
                variant={ShTextVariant.Body}
                style={styles.modalItemTitle}
              >
                Event
              </ShText>
              <ShText
                variant={ShTextVariant.LabelLight}
                style={styles.modalItemSubtitle}
              >
                Schedule games, training or meetings
              </ShText>
            </View>
            <ShIcon
              name={IconName.RightArrow}
              size={spacing.mdx}
              color={colorPalette.stoneGrey}
            />
          </TouchableOpacity>

          {/* Payment Request */}
          <TouchableOpacity
            style={styles.modalItem}
            onPress={handleNavigateToPayment}
          >
            <View style={styles.modalItemIconContainer}>
              <ShIcon
                name={IconName.Card}
                size={spacing.lgx}
                color={colorPalette.primaryGold}
              />
            </View>
            <View style={styles.modalItemTextContainer}>
              <ShText
                variant={ShTextVariant.Body}
                style={styles.modalItemTitle}
              >
                Payment Request
              </ShText>
              <ShText
                variant={ShTextVariant.LabelLight}
                style={styles.modalItemSubtitle}
              >
                Send payment requests to team members
              </ShText>
            </View>
            <ShIcon
              name={IconName.RightArrow}
              size={spacing.mdx}
              color={colorPalette.stoneGrey}
            />
          </TouchableOpacity>
          <ShSpacer size={spacing.marginBotBottomSheet} />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
BottomSheetCreateEvents.displayName = 'BottomSheetCreateEvents';

export default BottomSheetCreateEvents;

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    zIndex: 999,
    // paddingVertical: spacing.xxl,
  },
  modalHeader: {
    // marginBottom: spacing.xxl,
  },
  modalTitle: {
    color: colorPalette.textLight,
  },
  modalContent: {
    gap: spacing.modalItemGap,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `rgba(0, 0, 0, ${spacing.modalBackgroundOpacity})`,
    borderWidth: spacing.borderWidthThin,
    borderColor: `rgba(158, 155, 151, ${spacing.modalBorderOpacity})`,
    borderRadius: spacing.modalItemBorderRadius,
    padding: spacing.modalItemPadding,
    gap: spacing.modalItemIconGap,
  },
  modalItemIconContainer: {
    width: spacing.modalItemIconSize,
    height: spacing.modalItemIconSize,
    borderRadius: spacing.modalItemBorderRadius,
    backgroundColor: `rgba(234, 189, 34, ${spacing.modalIconBackgroundOpacity})`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalItemTextContainer: {
    flex: 1,
  },
  modalItemTitle: {
    color: colorPalette.textLight,
    marginBottom: spacing.xs,
  },
  modalItemSubtitle: {
    color: colorPalette.stoneGrey,
    lineHeight: spacing.mdx,
  },
});
