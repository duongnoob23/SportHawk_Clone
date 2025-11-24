import React from 'react';

import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ShIcon } from '@cmp/ShIcon';
import { ShText } from '@cmp/ShText';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant } from '@con/typography';

interface ShPostCardProps {
  clubName: string;
  clubType: string;
  clubLogo: any;
  timestamp: string;
  content: string;
  hashtags?: string[];
  image?: any;
  likes: number;
  comments: number;
  onLike?: () => void;
  onComment?: () => void;
  onMore?: () => void;
  testID?: string;
  showComment?: boolean;
}

export function ShPostCard({
  clubName,
  clubType,
  clubLogo,
  timestamp,
  content,
  hashtags = [],
  image,
  likes,
  comments,
  onLike,
  onComment,
  onMore,
  testID,
  showComment = true,
}: ShPostCardProps) {
  return (
    <View style={styles.container} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={clubLogo} style={styles.clubLogo} />
        <View style={styles.headerText}>
          <ShText variant={ShTextVariant.Body} color={colorPalette.textLight}>
            {clubName}
          </ShText>
          <ShText
            variant={ShTextVariant.LabelLight}
            color={colorPalette.stoneGrey}
          >
            {clubType}
          </ShText>
        </View>
        <ShText
          variant={ShTextVariant.Small}
          color={colorPalette.stoneGrey}
          style={{
            minWidth: spacing.postCardTimestampWidth,
            textAlign: 'right',
          }}
        >
          {timestamp}
        </ShText>
        <TouchableOpacity onPress={onMore} style={styles.moreButton}>
          <ShIcon
            name={IconName.Edit}
            size={spacing.postCardMoreButtonSize}
            color={colorPalette.stoneGrey}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <ShText
          variant={ShTextVariant.Label}
          color={colorPalette.lightText}
          style={{ lineHeight: spacing.lg }}
        >
          {content}
          {hashtags.length > 0 && (
            <>
              {`\n\n`}
              <ShText
                variant={ShTextVariant.Label}
                color={colorPalette.primaryGold}
              >
                {hashtags.map(tag => `#${tag}`).join(' ')}
              </ShText>
            </>
          )}
        </ShText>
      </View>

      {/* Image */}
      <View style={styles.contentContainer}>
        {image && (
          <Image source={image} style={styles.postImage} resizeMode="cover" />
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <ShIcon
            name={IconName.Heart2}
            size={spacing.iconSm}
            color={colorPalette.stoneGrey}
          />
          {likes > 0 && (
            <ShText
              variant={ShTextVariant.Small}
              color={colorPalette.stoneGrey}
            >
              {likes}
            </ShText>
          )}
        </TouchableOpacity>

        {showComment && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onComment}
            activeOpacity={0.7}
          >
            <ShIcon
              name={IconName.Comment}
              size={spacing.iconSm}
              color={colorPalette.stoneGrey}
            />
            {comments > 0 && (
              <ShText
                variant={ShTextVariant.Small}
                color={colorPalette.stoneGrey}
              >
                {comments}
              </ShText>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.postCardPadding,
    borderBottomWidth: spacing.borderWidthThin,
    borderBottomColor: colorPalette.borderPostCard,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.postCardHeaderGap,
    marginBottom: spacing.postCardGap,
  },
  clubLogo: {
    width: spacing.postCardClubLogoSize,
    height: spacing.postCardClubLogoSize,
    borderRadius: spacing.postCardClubLogoSize / 2,
  },
  headerText: {
    flex: 1,
    paddingTop: spacing.xs,
    gap: spacing.xs,
  },
  moreButton: {
    padding: spacing.none,
  },
  contentContainer: {
    gap: spacing.sm,
    marginBottom: spacing.postCardGap,
  },
  postImage: {
    width: '100%',
    borderRadius: spacing.postCardImageBorderRadius,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderPostImage,
    marginBottom: spacing.postCardGap,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.postCardActionsGap,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.postCardIconTextGap,
  },
});
