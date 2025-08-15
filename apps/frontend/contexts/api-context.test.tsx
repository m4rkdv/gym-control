import { renderHook, act } from '@testing-library/react';
import { useApi, ApiProvider } from './api-context';
import { AuthProvider } from './auth-context';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import React, { ReactNode } from 'react';
import { server } from '@/_test/setup';
import { http, HttpResponse } from 'msw';
import { useApiCall } from '@/hooks/use-api';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

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
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'token') return 'mock-jwt-token';
            if (key === 'user') return JSON.stringify({ id: '1', userName: 'test@example.com' });
            return null;
        });
    });
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
describe('Authorization header', () => {
    test('includes Bearer token when token is available', async () => {
        let capturedHeaders: Record<string, string> = {};
        server.use(
            http.get('*/api/users', ({ request }) => {
                capturedHeaders = Object.fromEntries(request.headers.entries());
                return HttpResponse.json([]);
            })
        );

        const { result } = renderHook(() => useApi(), { wrapper: TestWrapper });

        await act(async () => {
            await result.current.get('/api/users');
        });

        expect(capturedHeaders.authorization).toBe('Bearer mock-jwt-token');
    });
    test('handles errors correctly', async () => {
        const { result } = renderHook(() => useApi(), { wrapper: TestWrapper });

        await expect(async () => {
            await act(async () => {
                await result.current.get('/api/error');
            });
        }).rejects.toThrow('Server error');
    });
});
describe('useApiCall hook', () => {
    test('throws error when used outside ApiProvider', () => {
        expect(() => {
            renderHook(() => useApiCall());
        }).toThrow('useApi must be used within an ApiProvider');
    });

    test('provides executeGet and executePost functions and loading/error states', () => {
        const { result } = renderHook(() => useApiCall(), { wrapper: TestWrapper });

        expect(result.current).toHaveProperty('executeGet');
        expect(result.current).toHaveProperty('executePost');
        expect(result.current).toHaveProperty('loading');
        expect(result.current).toHaveProperty('error');
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    test('manages loading state during API call', async () => {
        const { result } = renderHook(() => useApiCall(), { wrapper: TestWrapper });

        expect(result.current.loading).toBe(false);

        let callPromise: Promise<unknown>;
        act(() => {
            callPromise = result.current.executeGet('/api/users');
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            await callPromise;
        });

        expect(result.current.loading).toBe(false);
    });

    test('returns data on successful request', async () => {
        const { result } = renderHook(() => useApiCall(), { wrapper: TestWrapper });

        let response: unknown;
        await act(async () => {
            response = await result.current.executeGet('/api/users');
        });

        expect(response).toBeTruthy();
        expect(result.current.error).toBeNull();
    });

    test('handles errors and sets error state', async () => {
        const { result } = renderHook(() => useApiCall(), { wrapper: TestWrapper });

        let response: unknown;
        await act(async () => {
            response = await result.current.executeGet('/api/error');
        });

        expect(response).toBeNull();
        expect(result.current.error).toBe('Server error');
    });
});