export type GoogleGeocodingResult = {
  country: string;
  city: string;
  address: string;
  formatted_address: string;
};

export const getLocationDetailsFromGoogle = async (
  lat: number,
  lng: number
): Promise<GoogleGeocodingResult | null> => {
  try {
    const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS;
    if (!googleApiKey) {
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`
    );

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];
    const addressComponents = result.address_components;
    let country = '';
    let city = '';
    let address = '';
    let states = '';

    for (const component of addressComponents) {
      const types = component.types;

      if (types.includes('country')) {
        country = component.long_name;
      }
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        states = component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('route') || types.includes('street_number')) {
        address = component.long_name;
      }
    }

    city = city || states;

    return {
      country,
      city,
      address,
      formatted_address: result.formatted_address,
    };
  } catch {
    return null;
  }
};
