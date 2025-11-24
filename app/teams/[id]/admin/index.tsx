import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ShScreenContainer, ShText } from '@top/components';
import { ShAdminGrid } from '@top/components/ShAdminGrid';
import { teamsApi } from '@top/lib/api/teams';
import { useUser } from '@top/hooks/useUser';
import { logger } from '@top/lib/utils/logger';
import { colorPalette } from '@con/colors';

export default function TeamAdminScreen() {
  const { id: teamId } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [teamId, user?.id]);

  const checkAdminStatus = async () => {
    if (!teamId || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Check if user is an admin
      const admins = await teamsApi.getTeamAdmins(teamId);
      const userIsAdmin = admins.some(
        (admin: any) => admin.user_id === user.id
      );
      setIsAdmin(userIsAdmin);

      if (!userIsAdmin) {
        logger.warn('ADM: Non-admin access attempt', {
          userId: user.id,
          teamId,
        });
        router.replace('/teams');
      }
    } catch (error) {
      logger.error('ADM: Error checking admin status', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleMembersPress = () => {
    router.push(`/teams/${teamId}/admin/manage-members`);
  };

  const handleAdminsPress = () => {
    router.push(`/teams/${teamId}/admin/manage-admins`);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.baseDark }}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={colorPalette.primaryGold} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.baseDark }}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ShText>You don&apos;t have permission to access this page</ShText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colorPalette.baseDark,
          },
          headerTintColor: colorPalette.lightText,
          headerTitle: 'Admin',
        }}
      />

      <ShScreenContainer>
        <ScrollView>
          <ShAdminGrid
            onMembersPress={handleMembersPress}
            onAdminsPress={handleAdminsPress}
          />
        </ScrollView>
      </ShScreenContainer>
    </>
  );
}
