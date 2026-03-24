const defaultApiBaseUrl = 'http://127.0.0.1:4000';

function getApiBaseUrl() {
  return process.env.PLATFORM_API_BASE_URL ?? defaultApiBaseUrl;
}

async function fetchPlatformJson(path) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Platform API request failed for ${path} with ${response.status}`);
  }

  return response.json();
}

export async function getStructuredPageFromPlatform(slug, fallbackPage) {
  try {
    const payload = await fetchPlatformJson(`/api/v1/public/structured-pages/${slug}`);
    return payload.data ?? fallbackPage;
  } catch {
    return fallbackPage;
  }
}

export async function getNewsFeedFromPlatform(fallbackMetadata, fallbackItems) {
  try {
    const payload = await fetchPlatformJson('/api/v1/public/news');
    return {
      metadata: payload.data?.metadata ?? fallbackMetadata,
      items: payload.data?.items ?? fallbackItems,
    };
  } catch {
    return {
      metadata: fallbackMetadata,
      items: fallbackItems,
    };
  }
}

export async function getEventsFeedFromPlatform(fallbackMetadata, fallbackItems) {
  try {
    const payload = await fetchPlatformJson('/api/v1/public/events');
    return {
      metadata: payload.data?.metadata ?? fallbackMetadata,
      items: payload.data?.items ?? fallbackItems,
    };
  } catch {
    return {
      metadata: fallbackMetadata,
      items: fallbackItems,
    };
  }
}

export async function getLiveWebcastFromPlatform(fallbackPayload) {
  try {
    const payload = await fetchPlatformJson('/api/v1/public/live-webcast');
    return {
      ...fallbackPayload,
      ...(payload.data ?? {}),
    };
  } catch {
    return fallbackPayload;
  }
}
