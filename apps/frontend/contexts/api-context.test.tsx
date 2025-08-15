import { renderHook, act } from '@testing-library/react';
import { useApi, ApiProvider } from './api-context';
import { AuthProvider } from './auth-context';
import { describe, expect, test, vi } from 'vitest';
import React, { ReactNode } from 'react';

function TestWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ApiProvider>
        {children}
      </ApiProvider>
    </AuthProvider>
  );
}

describe('ApiContext', () => {
  test('provides get and post methods', () => {
    const { result } = renderHook(() => useApi(), { wrapper: TestWrapper });

    expect(result.current).toHaveProperty('get');
    expect(result.current).toHaveProperty('post');
  });

  test('get method fetches data successfully', async () => {
    const { result } = renderHook(() => useApi(), { wrapper: TestWrapper });

    let response: unknown;
    await act(async () => {
      response = await result.current.get('/api/users');
    });

    expect(response).toBeTruthy();
  });
});