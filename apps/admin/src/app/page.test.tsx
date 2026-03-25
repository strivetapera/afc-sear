import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import Dashboard from './page';

describe('Dashboard', () => {
  test('renders dashboard heading', () => {
    render(<Dashboard />);
    expect(screen.getByText('Admin Dashboard')).toBeDefined();
  });

  test('renders core stat cards', () => {
    render(<Dashboard />);
    expect(screen.getByText('Total Members')).toBeDefined();
    expect(screen.getByText('Active Events')).toBeDefined();
  });
});
