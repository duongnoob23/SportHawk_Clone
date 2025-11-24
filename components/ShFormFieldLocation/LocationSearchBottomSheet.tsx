import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colorPalette } from '@top/constants/colors';
import { IconName } from '@top/constants/icons';
import { spacing } from '@top/constants/spacing';

import { fontSizes, ShTextVariant } from '@top/constants/typography';
import { ShIcon } from '../ShIcon';
import { ShText } from '../ShText';

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 400;

const createSessionToken = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

type LocationPrediction = {
  placeId: string;
  primaryText: string;
  secondaryText?: string;
  fullText: string;
};

export type LocationSearchResult = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

type LocationSearchBottomSheetProps = {
  onSelect: (result: LocationSearchResult) => void;
  initialQuery?: string;
} & Partial<BottomSheetModalProps>;

export const LocationSearchBottomSheet = forwardRef<
  BottomSheetModal,
  LocationSearchBottomSheetProps
>(({ onSelect, initialQuery = '', ...bottomSheetProps }, ref) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<LocationPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const sessionTokenRef = useRef(createSessionToken());
  const hasInitialisedOpenState = useRef(false);

  useEffect(() => {
    if (isOpen && !hasInitialisedOpenState.current) {
      hasInitialisedOpenState.current = true;
      setQuery(initialQuery);
      setResults([]);

      setSelectedPlaceId(null);
    }

    if (!isOpen) {
      hasInitialisedOpenState.current = false;
      sessionTokenRef.current = createSessionToken();
      setSelectedPlaceId(null);
    }
  }, [initialQuery, isOpen]);

  const defaultSnapPoints = useMemo(() => ['55%', '90%'], []);

  const renderBackdrop = useCallback(
    (
      props: Parameters<
        NonNullable<BottomSheetModalProps['backdropComponent']>
      >[0]
    ) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const trimmed = query.trim();

    if (!googleApiKey) {
      setResults([]);
      return;
    }

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const autocompleteUrl =
          'https://places.googleapis.com/v1/places:autocomplete';

        const response = await fetch(autocompleteUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask':
              'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text',
          },
          body: JSON.stringify({
            input: trimmed,
            sessionToken: sessionTokenRef.current,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.warn(
            'Google Places autocomplete HTTP error:',
            response.status,
            errorData
          );
          setResults([]);
          return;
        }

        const data = await response.json();

        if (data.suggestions && Array.isArray(data.suggestions)) {
          const parsed: LocationPrediction[] = data.suggestions
            .filter((suggestion: any) => suggestion.placePrediction)
            .map((suggestion: any) => {
              const pred = suggestion.placePrediction;
              return {
                placeId: pred.placeId,
                primaryText:
                  pred.structuredFormat?.mainText?.text ||
                  pred.text?.text ||
                  '',
                secondaryText:
                  pred.structuredFormat?.secondaryText?.text || undefined,
                fullText: pred.text?.text || '',
              };
            });
          setResults(parsed);
        } else {
          setResults([]);
        }
      } catch (searchError) {
        if ((searchError as Error).name === 'AbortError') {
          return;
        }
        console.error('Location search error:', searchError);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [googleApiKey, isOpen, query]);

  const handlePlaceSelect = useCallback(
    async (prediction: LocationPrediction) => {
      if (!googleApiKey) {
        return;
      }

      try {
        setSelectedPlaceId(prediction.placeId);

        // Places API v1: GET /places/{placeId}
        // Handle both formats: "places/PLACE_ID" or just "PLACE_ID"
        const placeIdForUrl = prediction.placeId.startsWith('places/')
          ? prediction.placeId
          : `places/${prediction.placeId}`;
        const detailsUrl = `https://places.googleapis.com/v1/${placeIdForUrl}`;

        const response = await fetch(detailsUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': 'location,displayName,formattedAddress',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.warn(
            'Google Places details HTTP error:',
            response.status,
            errorData
          );
          return;
        }

        const data = await response.json();

        if (data.location?.latitude && data.location?.longitude) {
          const result: LocationSearchResult = {
            name: data.displayName?.text || prediction.primaryText,
            address: data.formattedAddress || prediction.fullText,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
          };

          onSelect(result);
          bottomSheetRef.current?.dismiss();
        } else {
          console.warn(
            'Google Places details error: Missing location data',
            data
          );
        }
      } catch (detailsError) {
        console.error('Location details error:', detailsError);
      } finally {
        setSelectedPlaceId(null);
      }
    },
    [googleApiKey, onSelect]
  );

  const renderItem = useCallback(
    ({ item }: { item: LocationPrediction }) => (
      <TouchableOpacity
        style={styles.resultRow}
        onPress={() => handlePlaceSelect(item)}
        activeOpacity={0.8}
      >
        <View style={styles.resultTextContainer}>
          <ShText variant={ShTextVariant.Body}>{item.primaryText}</ShText>
          {item.secondaryText ? (
            <ShText
              variant={ShTextVariant.Small}
              style={styles.resultSecondaryText}
            >
              {item.secondaryText}
            </ShText>
          ) : null}
        </View>
        {selectedPlaceId === item.placeId ? (
          <ActivityIndicator size="small" color={colorPalette.primaryGold} />
        ) : (
          <ShIcon
            name={IconName.ArrowForward}
            size={spacing.iconSizeSmall}
            color={colorPalette.primaryGold}
          />
        )}
      </TouchableOpacity>
    ),
    [handlePlaceSelect, selectedPlaceId]
  );

  const keyExtractor = useCallback(
    (item: LocationPrediction) => item.placeId,
    []
  );

  const handleSheetChange = useCallback((index: number) => {
    setIsOpen(index >= 0);
  }, []);

  useImperativeHandle(ref, () => ({
    present: (...args) => {
      bottomSheetRef.current?.present(
        ...(args as Parameters<
          NonNullable<typeof bottomSheetRef.current>['present']
        >)
      );
    },
    dismiss: (...args) => {
      bottomSheetRef.current?.dismiss(
        ...(args as Parameters<
          NonNullable<typeof bottomSheetRef.current>['dismiss']
        >)
      );
    },
    close: () => {
      bottomSheetRef.current?.close();
    },
    snapToIndex: (...args) => {
      bottomSheetRef.current?.snapToIndex(
        ...(args as Parameters<
          NonNullable<typeof bottomSheetRef.current>['snapToIndex']
        >)
      );
    },
    snapToPosition: (...args) => {
      bottomSheetRef.current?.snapToPosition(
        ...(args as Parameters<
          NonNullable<typeof bottomSheetRef.current>['snapToPosition']
        >)
      );
    },
    expand: () => {
      bottomSheetRef.current?.expand();
    },
    collapse: () => {
      bottomSheetRef.current?.collapse();
    },
    forceClose: () => {
      bottomSheetRef.current?.forceClose?.();
    },
  }));

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={bottomSheetProps.snapPoints || defaultSnapPoints}
      backdropComponent={bottomSheetProps.backdropComponent || renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      onChange={handleSheetChange}
      {...bottomSheetProps}
    >
      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <ShIcon
            name={IconName.Search}
            size={spacing.iconSizeMedium}
            color={colorPalette.stoneGrey}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search address"
            placeholderTextColor={colorPalette.stoneGrey}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>

        {loading && results.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={colorPalette.primaryGold} />
          </View>
        ) : (
          <BottomSheetFlatList
            data={results}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              query.trim().length >= MIN_QUERY_LENGTH && !loading ? (
                <ShText
                  variant={ShTextVariant.Small}
                  style={styles.emptyStateText}
                >
                  No results found
                </ShText>
              ) : null
            }
          />
        )}
      </View>
    </BottomSheetModal>
  );
});

LocationSearchBottomSheet.displayName = 'LocationSearchBottomSheet';

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colorPalette.baseDark,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  handleIndicator: {
    backgroundColor: colorPalette.stoneGrey,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colorPalette.baseDark,
    borderWidth: spacing.borderWidthThin,
    borderColor: colorPalette.borderInputField,
    borderRadius: spacing.borderRadiusLarge,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colorPalette.white,
    fontSize: fontSizes.md,
  },
  loaderContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colorPalette.borderInputField,
  },
  resultTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  resultSecondaryText: {
    color: colorPalette.stoneGrey,
    marginTop: spacing.xs,
  },
  emptyStateText: {
    color: colorPalette.stoneGrey,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  errorText: {
    color: colorPalette.primaryGold,
  },
});
