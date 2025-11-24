import { colorPalette } from '@con/colors';
import { Routes } from '@con/routes';
import {
  ShClubCard,
  ShScreenContainer,
  ShSearchBar,
  ShSpacer,
  ShSportFilterBar,
  ShText,
} from '@top/components';
import { spacing } from '@top/constants/spacing';
import { ShTextVariant } from '@top/constants/typography';
import { useClubs } from '@top/features/clubs/hooks/useTeams';
import { useUser } from '@top/hooks/useUser';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Club {
  id: string;
  name: string;
  location_city?: string;
  location_state?: string;
  location_postcode?: string;
  about_description?: string;
  sports?: string[];
  club_badge_url?: string | null;
  background_image_url?: string | null;
  contact_phone?: string;
  member_count?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export default function ExploreScreen() {
  const { user } = useUser();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(''); // ✅ giá trị search có debounce
  const [selectedSport, setSelectedSport] = useState('Football');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const {
    data: dataClus,
    refetch: refetchDataClubs,
    isLoading: loadingDataClub,
  } = useClubs({
    searchTerm: '',
    sport: 'All',
    limit: 50,
  });

  const clubsItem = useMemo(() => {
    if (!dataClus || !dataClus.clubs) return [];

    const formattedClubs = dataClus.clubs.map(club => {
      return {
        id: club.id,
        name: club.name,
        location_city: club.location_city || '',
        location_state: club.location_state || '',
        member_count: club.member_count || 0,
        club_badge_url: club.club_badge_url || null,
        sport_type: club.sport_type || '',
        team_count: club.teams.length,
      };
    });

    return formattedClubs;
  }, [dataClus]);

  const filteredClubs = useMemo(() => {
    let filtered = [...clubsItem];

    if (selectedSport !== 'All') {
      filtered = filtered.filter(club =>
        club.sport_type.toLowerCase().includes(selectedSport.toLowerCase())
      );
    }
    if (debouncedSearch) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(debouncedSearch)
      );
    }

    setLoading(false);

    return filtered;
  }, [clubsItem, selectedSport, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const normalized = searchText.trim().toLowerCase();
      setDebouncedSearch(normalized);
      setLoading(false);
    }, 750);

    return () => clearTimeout(handler);
  }, [searchText]);

  const handleClubPress = useCallback((clubId: string) => {
    router.push(Routes.ClubDetails(clubId));
  }, []);

  const handleSportSelect = useCallback((sport: string) => {
    setSelectedSport(sport);
  }, []);

  const handleSearch = useCallback((text: string) => {
    setLoading(true);
    setSearchText(text);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const renderEmptyState = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.xl,
        }}
      >
        <ShText
          variant={ShTextVariant.EmptyState}
          style={{ textAlign: 'center' }}
        >
          {searchText ? 'No clubs found' : 'No clubs available'}
        </ShText>
      </View>
    );
  };

  const renderHeader = () => (
    <>
      <ShSearchBar
        onSearch={handleSearch}
        placeholder="Start your search..."
        isLoading={loading}
        value={searchText}
        isDisplayFilter={false}
      />
      <ShSpacer size={spacing.xl} />
      <ShSportFilterBar
        selectedSport={selectedSport}
        onSportSelect={handleSportSelect}
      />
    </>
  );

  if (loading || loadingDataClub) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colorPalette.baseDark,
          paddingTop: insets.top,
        }}
      >
        {renderHeader()}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: insets.top,
            backgroundColor: colorPalette.baseDark,
          }}
        >
          <ActivityIndicator size="large" color={colorPalette.primaryGold} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colorPalette.baseDark,
        paddingTop: insets.top,
      }}
    >
      {renderHeader()}
      <ShSpacer size={spacing.xxl} />

      <ShScreenContainer scrollable={false} style={{ backgroundColor: 'red' }}>
        <FlatList
          data={filteredClubs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <>
              <ShClubCard club={item} onPress={handleClubPress} />
            </>
          )}
          ListEmptyComponent={renderEmptyState}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Map Button */}
      </ShScreenContainer>
    </View>
  );
}
