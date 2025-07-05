import { OPENCAGE_API_KEY } from '@env';

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
    );

    const data = await response.json();
    if (data.results.length > 0) {
      return data.results[0].formatted;
    } else {
      return 'Address not found';
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return 'Error fetching address';
  }
};
