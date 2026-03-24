export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  
  // This would ideally come from a session or context
  // For the initial build, we'll suggest obtaining this via the login flow
  const token = typeof window !== 'undefined' ? localStorage.getItem('afc_access_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    const error = await response.json().catch(() => ({ message: 'API Request failed' }));
    throw new Error(error.message || 'API Request failed');
  }

  return response.json();
}
