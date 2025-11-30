import { ShIcon } from '@cmp/ShIcon';
import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { fontSizes } from '@con/typography';
import { useUser } from '@hks/useUser';
import IconBell from '@ict/IconBell';
import IconBellGray from '@ict/IconBellGray';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppLayout() {
  const { user, authChecked } = useUser();
  const insets = useSafeAreaInsets();

  // if (!authChecked) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color={colorPalette.primaryGold} />
  //       <ShText variant={ShTextVariant.Body} style={styles.loadingText}>
  //         Loading...
  //       </ShText>
  //     </View>
  //   );
  // }

  // if (!user?.email_confirmed_at) {
  //   return <Redirect href={Routes.Welcome} />;
  // }

  // Show app screens for authenticated users with tab navigation
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorPalette.black,
          borderTopColor: colorPalette.borderInputField,
          borderTopWidth: 1,
          height: spacing.tabBarHeight + insets.bottom,
          // paddingBottom: spacing.lg,
          paddingBottom: 0,
          paddingTop: spacing.sm,
        },
        tabBarActiveTintColor: colorPalette.primaryGold,
        tabBarInactiveTintColor: colorPalette.stoneGrey,
        tabBarLabelStyle: {
          fontSize: fontSizes.xs,
          marginTop: spacing.xs,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <ShIcon
                name={
                  color === colorPalette.primaryGold
                    ? IconName.Home
                    : IconName.HomeGray
                }
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Teams',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <ShIcon
                name={
                  color === colorPalette.primaryGold
                    ? IconName.Team
                    : IconName.TeamGray
                }
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <ShIcon
                name={
                  color === colorPalette.primaryGold
                    ? IconName.Compass
                    : IconName.CompassGray
                }
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              {focused ? (
                <IconBell color={color} width={size} height={size} />
              ) : (
                <IconBellGray width={size} height={size} />
              )}

              {/*
              <ShIcon
                name={
                  color === colorPalette.primaryGold
                    ? IconName.Bell
                    : IconName.BellGray
                }
                size={size}
                color={color}
              />
               */}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.tabIconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <ShIcon
                name={
                  color === colorPalette.primaryGold
                    ? IconName.PersonFill
                    : IconName.PersonFillGray
                }
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide settings from tab bar but keep it accessible via navigation
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorPalette.baseDark,
  },
  loadingText: {
    marginTop: 16,
    color: colorPalette.textMid,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -spacing.tabIndicatorOffset,
    width: spacing.tabIndicatorWidth,
    height: spacing.tabIndicatorHeight,
    backgroundColor: colorPalette.primaryGold,
  },
});
