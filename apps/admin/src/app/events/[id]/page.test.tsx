import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import React from 'react';
import EventEditPage from './page';
import { fetchApi } from '@/lib/api-client';

// Mock the React.use() behavior for testing
vi.mock('react', async () => {
  const actual = await vi.importActual('react') as any;
  return {
    ...actual,
    use: (promise: any) => {
      // Return the value directly for tests to avoid Suspense issues in simple unit tests
      if (promise && typeof promise.then === 'function') {
          return { id: 'test-event-id' };
      }
      return actual.use(promise);
    }
  };
});

describe('EventEditPage', () => {
  test('renders immediately with mocked params', async () => {
    (fetchApi as any).mockImplementation((path: string) => {
      if (path === '/admin/events') {
        return Promise.resolve({ data: [] });
      }

      if (path === '/admin/events/test-event-id/registrations') {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });

    const params = new Promise<{ id: string }>(() => {}); // Never resolves
    render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <EventEditPage params={params} />
      </React.Suspense>
    );
    await waitFor(() => {
      expect(screen.getByText(/Untitled Event/i)).toBeDefined();
    });
  });

  test('renders event data after loading', async () => {
    const mockEvent = {
        id: 'test-event-id',
        title: 'Master Class Worship',
        summary: 'A great event',
        description: 'Detailed description',
        registrationMode: 'OPEN',
        eventType: 'CONFERENCE'
    };

    (fetchApi as any).mockImplementation((path: string) => {
      if (path === '/admin/events') {
        return Promise.resolve({ data: [mockEvent] });
      }

      if (path === '/admin/events/test-event-id/registrations') {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });

    const params = Promise.resolve({ id: 'test-event-id' });
    render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <EventEditPage params={params} />
      </React.Suspense>
    );

    // Wait for the mock fetch to be called and the component to update
    await waitFor(() => {
        expect(screen.getByText('Master Class Worship')).toBeDefined();
    }, { timeout: 3000 });
  });
});
