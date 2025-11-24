import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import { ShIcon, ShText } from '@top/components';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { UserTeam } from '../../types';

interface CreateNewModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTeam: UserTeam | null;
}

const ModalCreateEvents = ({
  visible,
  onClose,
  selectedTeam,
}: CreateNewModalProps) => {
  const router = useRouter();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ShText
              variant={ShTextVariant.SectionTitle}
              style={styles.modalTitle}
            >
              Create New
            </ShText>
            <TouchableOpacity onPress={onClose}>
              <ShIcon
                name={IconName.Close}
                size={spacing.modalCloseButtonSize}
                color={colorPalette.textLight}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* <TouchableOpacity style={styles.modalItem}>
              <View style={styles.modalItemIconContainer}>
                <ShIcon
                  name={IconName.Gallery}
                  size={spacing.iconSizeSmall}
                  color={colorPalette.primaryGold}
                />
              </View>
              <View style={styles.modalItemTextContainer}>
                <ShText
                  variant={ShTextVariant.Body}
                  style={styles.modalItemTitle}
                >
                  Post
                </ShText>
                <ShText
                  variant={ShTextVariant.LabelLight}
                  style={styles.modalItemSubtitle}
                >
                  Share team news, updates and more
                </ShText>
              </View>
              <ShIcon
                name={IconName.RightArrow}
                size={spacing.iconSizeSmall}
                color={colorPalette.stoneGrey}
              />
            </TouchableOpacity> */}

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                onClose();
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
              }}
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

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                onClose();
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
              }}
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

            {/* <TouchableOpacity style={styles.modalItem}>
              <View style={styles.modalItemIconContainer}>
                <ShIcon
                  name={IconName.BellOutline}
                  size={spacing.iconSizeSmall}
                  color={colorPalette.primaryGold}
                />
              </View>
              <View style={styles.modalItemTextContainer}>
                <ShText
                  variant={ShTextVariant.Body}
                  style={styles.modalItemTitle}
                >
                  Alert
                </ShText>
                <ShText
                  variant={ShTextVariant.LabelLight}
                  style={styles.modalItemSubtitle}
                >
                  Send notifications to team members
                </ShText>
              </View>
              <ShIcon
                name={IconName.RightArrow}
                size={spacing.sm}
                color={colorPalette.stoneGrey}
              />
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colorPalette.modalOverlay,
  },
  modalContainer: {
    backgroundColor: colorPalette.baseDark,
    borderTopLeftRadius: spacing.modalBorderRadiusTop,
    borderTopRightRadius: spacing.modalBorderRadiusTop,
    borderTopWidth: spacing.borderWidthThin,
    borderTopColor: `rgba(158, 155, 151, 0.4)`,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.modalContentPadding,
    paddingTop: spacing.modalHeaderPadding,
  },
  modalTitle: {
    color: colorPalette.textLight,
  },
  modalContent: {
    paddingHorizontal: spacing.modalContentPadding,
    marginTop: spacing.xxxl,
    gap: spacing.modalItemGap,
    marginBottom: spacing.tabBarHeight,
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
    // marginBottom: spacing.modalItemGap,
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

export default ModalCreateEvents;
