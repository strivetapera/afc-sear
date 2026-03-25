import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock React.use globally for Next.js 15+ async params
const originalUse = React.use;
(React as any).use = (promise: any) => {
  if (promise && typeof promise.then === 'function' && (promise as any)._status === 'fulfilled') {
      return (promise as any)._value;
  }
  // Fallback for simple tests: if it's a promise, try to return a test ID or let it suspend
  if (promise && typeof promise.then === 'function') {
      return { id: 'test-event-id', slug: 'test-slug' };
  }
  return originalUse ? originalUse(promise) : promise;
};

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock API client
vi.mock('@/lib/api-client', () => ({
  fetchApi: vi.fn(),
}));

// Mock UI library
vi.mock('@afc-sear/ui', () => ({
  Button: ({ children, onClick, disabled }: any) => React.createElement('button', { onClick, disabled }, children),
  Input: (props: any) => React.createElement('input', props),
  Card: ({ children }: any) => React.createElement('div', null, children),
  CardHeader: ({ children }: any) => React.createElement('div', null, children),
  CardTitle: ({ children }: any) => React.createElement('h2', null, children),
  CardContent: ({ children }: any) => React.createElement('div', null, children),
  Badge: ({ children }: any) => React.createElement('span', null, children),
}));
