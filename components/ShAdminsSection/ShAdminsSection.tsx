import { ShIcon } from '@cmp/ShIcon';
import { ShText } from '@cmp/ShText';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ShAvatar } from '../ShAvatar';
import { ShSpacer } from '../ShSpacer';
import { styles } from './ShAdminsSection.styles';

interface Admin {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

interface ShAdminsSectionProps {
  title?: string;
  admins: Admin[];
  emptyText?: string;
}

export const ShAdminsSection: React.FC<ShAdminsSectionProps> = ({
  title = 'Club Admins',
  admins,
  emptyText = 'No admins listed',
}) => {
  return (
    <View style={styles.container}>
      <ShText variant={ShTextVariant.SectionTitle}>{title}</ShText>
      <ShSpacer size={spacing.xxl} />
      {admins.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ShText variant={ShTextVariant.EmptyState}>{emptyText}</ShText>
        </View>
      ) : (
        <View style={styles.adminsList}>
          {admins.map(admin => (
            <TouchableOpacity
              key={admin.id}
              style={styles.adminCard}
              activeOpacity={0.7}
            >
              <View style={styles.adminInfo}>
                {admin.avatarUrl ? (
                  // <Image
                  //   source={{ uri: admin.avatarUrl }}
                  //   style={styles.adminAvatar}
                  // />
                  <ShAvatar
                    size={spacing.avatarSizeLarge}
                    imageUri={admin.avatarUrl}
                    name={'Name'}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <ShIcon
                      name={IconName.User}
                      size={spacing.iconSizeSmall}
                      color={colorPalette.stoneGrey}
                    />
                  </View>
                )}
                <View style={styles.adminDetails}>
                  <ShText variant={ShTextVariant.Body}>{admin.name}</ShText>
                  {admin.role && (
                    <ShText variant={ShTextVariant.Caption}>
                      {admin.role}
                    </ShText>
                  )}
                </View>
              </View>
              <View style={styles.adminBadge}>
                <ShIcon
                  name={IconName.Admin}
                  size={spacing.iconSizeSmall}
                  color={colorPalette.primaryGold}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};
