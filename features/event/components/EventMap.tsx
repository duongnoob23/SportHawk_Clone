import { spacing } from '@con/spacing';
import React, { useMemo } from 'react';
import { Linking, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { EventDetailData } from '../types';

export type Props = {
  detailDataFix?: EventDetailData;
};

export default function EventMap({ detailDataFix }: Props) {
  const region = useMemo(() => {
    const latitude = detailDataFix?.locationLatitude ?? 10.762622;
    const longitude = detailDataFix?.locationLongitude ?? 106.660172;

    return {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [detailDataFix]);

  const openInMaps = () => {
    const { latitude, longitude } = region;
    const label = encodeURIComponent(
      detailDataFix?.locationName ?? 'Event location'
    );
    const url = `https://www.google.com/maps?q=${latitude},${longitude}(${label})`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={openInMaps}
      style={styles.mapContainer}
    >
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        pointerEvents="none"
      >
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title={detailDataFix?.locationName ?? 'Event location'}
          description="Bấm để mở trong Google Maps"
        />
      </MapView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: spacing.mapHeight,
    borderRadius: spacing.borderRadiusMedium,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  map: { flex: 1 },
});
