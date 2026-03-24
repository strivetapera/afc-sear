import {
  churchLocations,
  locationsOverview,
  locationsPage,
  regionContacts,
} from '../data/locationsData';

const defaultApiBaseUrl = 'http://127.0.0.1:4000';

function getApiBaseUrl() {
  return process.env.PLATFORM_API_BASE_URL ?? defaultApiBaseUrl;
}

function getFallbackLocationsDirectory() {
  const groupedLocations = Object.values(
    churchLocations.reduce((accumulator, location) => {
      if (!accumulator[location.country]) {
        accumulator[location.country] = {
          country: location.country,
          locations: [],
        };
      }

      accumulator[location.country].locations.push(location);
      return accumulator;
    }, {})
  )
    .map((group) => ({
      ...group,
      locations: [...group.locations].sort((a, b) => a.city.localeCompare(b.city)),
    }))
    .sort((a, b) => a.country.localeCompare(b.country));

  return {
    contacts: regionContacts,
    groupedLocations,
    metadata: locationsPage,
    overview: locationsOverview,
  };
}

export async function getLocationsDirectoryFromPlatform() {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/public/locations-directory`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Platform API request failed with ${response.status}`);
    }

    const payload = await response.json();
    return payload.data ?? getFallbackLocationsDirectory();
  } catch {
    return getFallbackLocationsDirectory();
  }
}
