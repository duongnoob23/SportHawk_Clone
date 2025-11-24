import {
  ShLogoAndTitle,
  ShPostCard,
  ShReminderCard,
  ShRemindersSection,
} from '@cmp/index';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { Routes } from '@con/routes';
import { spacing } from '@con/spacing';
import { useUser } from '@hks/useUser';
import { logger } from '@lib/utils/logger';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  // SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const samplePosts = [
  {
    id: '1',
    clubName: 'Fremington FC',
    clubType: 'Football Club',
    clubLogo: require('@ass/club-logos/fremington-fc.png'),
    timestamp: '18h',
    content:
      'This Saturday is the penultimate game of the season for the reserves who are hoping for a late charge at the top 3 in the North Devon Senior Division. Boca are the opponents who require a win to keep their hopes of winning the league alive. Kick off is at 2:30pm. ⚫⚪',
    hashtags: ['football', 'northdevon'],
    image: require('@ass/post-images/fremington-match.png'),
    likes: 25,
    comments: 5,
  },
  {
    id: '2',
    clubName: 'Fremington FC',
    clubType: 'Football Club',
    clubLogo: require('@ass/club-logos/fremington-fc.png'),
    timestamp: 'Jun 31',
    content:
      'These are the moments we live for 🔥\n\nThe boys bring home 3 points for Frem!',
    hashtags: ['football', 'northdevon'],
    image: require('@ass/post-images/fremington-celebration.png'),
    likes: 0,
    comments: 0,
  },
];

export default function HomeScreen() {
  const { profile } = useUser();
  const [posts, setPosts] = useState(samplePosts);
  const insets = useSafeAreaInsets();
  // Check for reminders
  const hasProfilePicture = !!profile?.profile_photo_uri;

  const handleLike = (postId: string) => {
    setPosts(
      posts.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleComment = (postId: string) => {
    Alert.alert('Comments', 'Comments functionality coming soon!');
  };

  const handleMore = (postId: string) => {
    Alert.alert('Post Options', 'Post options coming soon!');
  };

  const handleSetProfilePicture = () => {
    logger.log('[USR-004] User clicked Set Profile Picture reminder');
    router.push(Routes.EditProfile);
  };


  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.topNav}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <ShLogoAndTitle variant="xs" showTitle={false} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Reminders Section */}
        {!hasProfilePicture && (
          <ShRemindersSection reminderCount={!hasProfilePicture ? 1 : 0}>
            {!hasProfilePicture && (
              <ShReminderCard
                type="profile_picture"
                title="Complete Your Profile"
                description="Add a profile picture to help others recognize you"
                buttonText="Set profile picture"
                onAction={handleSetProfilePicture}
                icon={IconName.Camera}
              />
            )}
          </ShRemindersSection>
        )}

        {posts.map(post => (
          <ShPostCard
            key={post.id}
            clubName={post.clubName}
            clubType={post.clubType}
            clubLogo={post.clubLogo}
            timestamp={post.timestamp}
            content={post.content}
            hashtags={post.hashtags}
            image={post.image}
            likes={post.likes}
            comments={post.comments}
            onLike={() => handleLike(post.id)}
            onComment={() => handleComment(post.id)}
            onMore={() => handleMore(post.id)}
            showComment={false}
          />
        ))}
      </ScrollView>

      {/*
        <ShFloatingActionButton onPress={handleCreatePost} />
        */}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
  headerButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  topNav: {
    height: spacing.topNavHeight,
    backgroundColor: colorPalette.baseDark,
    borderBottomWidth: spacing.topNavBorderHeight,
    borderBottomColor: colorPalette.borderInputField,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: spacing.xxl,
    height: spacing.topNavLogoSize,
  },
  tabRow: {
    position: 'absolute',
    bottom: spacing.none,
    left: spacing.none,
    right: spacing.none,
    height: spacing.topNavTabHeight,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    top: -spacing.xs,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: spacing.none,
    width: spacing.topNavIndicatorWidth,
    height: spacing.topNavIndicatorHeight,
    backgroundColor: colorPalette.primaryGold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingBottom: spacing.tabBarHeight + spacing.lg,
  },
});
