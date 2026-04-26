import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import { redirect } from 'next/navigation';
import RootPage from './page';

describe('RootPage', () => {
  test('redirects visitors to the dashboard', () => {
    render(<RootPage />);
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });
});
