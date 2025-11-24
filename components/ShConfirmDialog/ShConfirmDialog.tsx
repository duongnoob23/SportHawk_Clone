import { ShButton } from '@cmp/ShButton';
import { ShText } from '@cmp/ShText';
import { ShButtonVariant } from '@con/buttons';
import { ShTextVariant } from '@con/typography';
import { spacing } from '@top/constants/spacing';
import React from 'react';
import { ActivityIndicator, Modal, TouchableOpacity, View } from 'react-native';
import { ShSpacer } from '../ShSpacer';
import { styles } from './styles';

interface ShConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ShConfirmDialog: React.FC<ShConfirmDialogProps> = ({
  visible,
  title,
  message,
  cancelText = 'Cancel',
  confirmText = 'Continue',
  onCancel,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.dialogContainer}
          onPress={e => e.stopPropagation()}
        >
          <ShText variant={ShTextVariant.Heading} style={styles.title}>
            {title}
          </ShText>

          <ShSpacer size={spacing.xxl} />

          <ShText variant={ShTextVariant.Body} style={styles.message}>
            {message}
          </ShText>

          <ShSpacer size={spacing.xxl} />

          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <ShButton
                variant={ShButtonVariant.Primary}
                onPress={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  confirmText
                )}
              </ShButton>
            </View>
            <ShSpacer size={spacing.md} />
            <View style={styles.buttonWrapper}>
              <ShButton
                variant={ShButtonVariant.Secondary}
                onPress={onCancel}
                disabled={isLoading}
              >
                {cancelText}
              </ShButton>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
