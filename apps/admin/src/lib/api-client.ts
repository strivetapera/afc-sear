export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/v1\/?$/, '');
  const baseUrl = `${apiOrigin}/api/v1`;
  
  const headers: HeadersInit = { ...options.headers };
  const headersObj = new Headers(headers);

  // Only set Content-Type if there's a body
  if (options.body) {
    headersObj.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: headersObj,
    credentials: options.credentials || 'include',
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
      window.location.href = '/auth/login';
    }
    const error = await response.json().catch(() => ({ message: 'API Request failed' }));
    throw new Error(error.message || 'API Request failed');
  }

  return response.json();
}
