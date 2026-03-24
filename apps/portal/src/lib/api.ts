const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001/api/v1';

export async function portalApi(path: string, options: RequestInit = {}): Promise<any> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('portal_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('portal_token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('portal_token', token);
}

export function clearStoredToken(): void {
  localStorage.removeItem('portal_token');
}
