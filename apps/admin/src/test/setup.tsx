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
  redirect: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock API client
vi.mock('@/lib/api-client', () => ({
  fetchApi: vi.fn(() => Promise.resolve({ data: [] })),
}));

// Mock UI library
vi.mock('@afc-sear/ui', () => ({
  Button: ({ children, onClick, disabled, type = 'button', ...props }: any) =>
    React.createElement('button', { onClick, disabled, type, ...props }, children),
  Input: ({ label, ...props }: any) =>
    React.createElement(
      'label',
      null,
      label ? React.createElement('span', null, label) : null,
      React.createElement('input', props)
    ),
  Card: ({ children }: any) => React.createElement('div', null, children),
  CardHeader: ({ children }: any) => React.createElement('div', null, children),
  CardTitle: ({ children }: any) => React.createElement('h2', null, children),
  CardContent: ({ children }: any) => React.createElement('div', null, children),
  Badge: ({ children }: any) => React.createElement('span', null, children),
  GradientText: ({ children }: any) => React.createElement(React.Fragment, null, children),
  GlassCard: ({ children }: any) => React.createElement('div', null, children),
  DynamicContainer: ({ children }: any) => React.createElement('div', null, children),
  Skeleton: () => React.createElement('div', null, 'Loading...'),
}));
