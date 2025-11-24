import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
import { spacing } from '@con/spacing';

interface ShMapViewProps {
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  clubs?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    sport: string;
  }[];
}

export const ShMapView: React.FC<ShMapViewProps> = ({ region, clubs }) => {
  // Default region if none provided (Melbourne area)
  const defaultRegion = {
    latitude: spacing.mapDefaultLatitude,
    longitude: spacing.mapDefaultLongitude,
    latitudeDelta: spacing.mapDefaultLatitudeDelta,
    longitudeDelta: spacing.mapDefaultLongitudeDelta,
  };

  const mapRegion = region || defaultRegion;

  return (
    <View style={styles.container}>
      <MapView
        provider={Platform.OS === 'ios' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {clubs?.map(club => (
          <Marker
            key={club.id}
            coordinate={{
              latitude: club.latitude,
              longitude: club.longitude,
            }}
            title={club.name}
            description={club.sport}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: spacing.borderRadiusLarge,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
