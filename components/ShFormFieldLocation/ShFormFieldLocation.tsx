import { colorPalette } from '@con/colors';
import { IconName } from '@con/icons';
import { spacing } from '@con/spacing';
import { ShTextVariant, fontSizes, fontWeights } from '@con/typography';
import useEventFormStore from '@top/stores/eventFormStore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ShIcon } from '../ShIcon';
import { ShMapView } from '../ShMapView';
import { ShText } from '../ShText';

interface ShFormFieldLocationProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  editable?: boolean;
  showMapPreview?: boolean;
  testID?: string;
  onPress?: () => void;
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
  helperText?: string;
}

export function ShFormFieldLocation({
  label = 'Location',
  placeholder = 'Enter UK postcode',
  value,
  onChangeText,
  error,
  required = false,
  editable = true,
  showMapPreview = true,
  testID,
  onPress,
  coordinates: coordinatesProp = null,
  helperText,
}: ShFormFieldLocationProps) {
  const { formData } = useEventFormStore();
  const { locationLatitude, locationLongitude } = formData;

  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  // Debounced geocoding using postcodes.io when coordinates are not provided
  useEffect(() => {
    if (coordinatesProp) {
      setCoordinates(coordinatesProp);
      setGeocodeError(null);
      setIsGeocoding(false);
      return;
    }

    const trimmedValue = value.trim();
    const cleanPostcode = trimmedValue.replace(/\s/g, '').toUpperCase();

    // Basic UK postcode validation (loose check)
    const postcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?[0-9][A-Z]{2}$/;

    if (!cleanPostcode || cleanPostcode.length < 5) {
      setCoordinates(null);
      setGeocodeError(null);
      setIsGeocoding(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsGeocoding(true);
      setGeocodeError(null);

      try {
        // Use postcodes.io free API for UK postcodes
        const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 200 && data.result) {
          const { latitude, longitude } = data.result;
          setCoordinates({ latitude, longitude });
          setGeocodeError(null);
        } else {
          setCoordinates(null);
          if (postcodeRegex.test(cleanPostcode)) {
            setGeocodeError('Postcode not found');
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setCoordinates(null);
        setGeocodeError('Error looking up postcode');
      } finally {
        setIsGeocoding(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [value, coordinatesProp]);

  useEffect(() => {
    if (locationLatitude && locationLongitude) {
      const payload = {
        latitude: locationLatitude,
        longitude: locationLongitude,
      };
      setCoordinates(payload || null);
    }
  }, [formData]);
  const isTextInputEditable = editable && !onPress;

  const inputElement = (
    <TextInput
      style={[
        styles.inputContainer,
        error && styles.inputError,
        !isTextInputEditable && styles.inputDisabled,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colorPalette.stoneGrey}
      editable={isTextInputEditable}
      pointerEvents={isTextInputEditable ? 'auto' : 'none'}
      testID={testID}
      autoCapitalize="words"
      autoCorrect={false}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ShText variant={ShTextVariant.Label}>
          {label}
          {required && (
            <ShText
              variant={ShTextVariant.Label}
              color={colorPalette.primaryGold}
            >
              {' '}
              *
            </ShText>
          )}
        </ShText>
      </View>

      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          {inputElement}
        </TouchableOpacity>
      ) : (
        inputElement
      )}

      {helperText ? (
        <ShText variant={ShTextVariant.Small} style={styles.helperText}>
          {helperText}
        </ShText>
      ) : null}

      {showMapPreview && (
        <View style={styles.mapPreview}>
          {coordinates ? (
            <ShMapView
              region={{
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              clubs={[
                {
                  id: 'location',
                  name: value,
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                  sport: 'Event Location',
                },
              ]}
            />
          ) : (
            <View style={styles.mapPlaceholder}>
              {isGeocoding ? (
                <ActivityIndicator
                  size="small"
                  color={colorPalette.primaryGold}
                />
              ) : (
                <>
                  <ShIcon
                    name={IconName.Pin}
                    size={spacing.iconSizeMedium}
                    color={colorPalette.stoneGrey}
                  />
                  <ShText
                    variant={ShTextVariant.Small}
                    style={styles.mapInstructions}
                  >
                    {''}
                  </ShText>
                </>
              )}
            </View>
          )}
        </View>
      )}

      {(error || (geocodeError && !isGeocoding)) && (
        <ShText variant={ShTextVariant.Small} style={styles.errorText}>
          {error || geocodeError}
        </ShText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colorPalette.baseDark,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusLarge,
    padding: spacing.md,
    minHeight: spacing.buttonHeightLarge,
    justifyContent: 'center',
    color: colorPalette.white,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.regular,
  },
  inputError: {
    borderColor: colorPalette.primaryGold,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputText: {
    color: colorPalette.white,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.regular,
  },
  mapPreview: {
    marginTop: spacing.sm,
    height: 160,
    backgroundColor: colorPalette.baseDark,
    borderRadius: spacing.borderRadiusLarge,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    overflow: 'hidden',
  },
  helperText: {
    color: colorPalette.stoneGrey,
    marginTop: spacing.xs,
  },
  errorText: {
    color: colorPalette.primaryGold,
    marginTop: spacing.xs,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mapInstructions: {
    color: colorPalette.baseDark,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
