import { renderHook, act } from '@testing-library/react';
import { useApiCall } from './use-api';
import { AuthProvider } from '../contexts/auth-context';
import { ApiProvider } from '../contexts/api-context';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { server } from '../_test/setup';
import { http } from 'msw';
import React, { ReactNode } from 'react';

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

describe('useApiCall hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockImplementation((key) => {
            if (key === 'token') return 'mock-jwt-token';
            if (key === 'user') return JSON.stringify({ id: '1', userName: 'test@example.com' });
            return null;
        });
    });

    test('useApiCall outside provider throws error', () => {
        expect(() => {
            renderHook(() => useApiCall());
        }).toThrow('useApi must be used within an ApiProvider');
    });

    test('useApiCall within provider exposes executeGet executePost loading error and setError', () => {
        const { result } = renderHook(() => useApiCall(), { wrapper: TestWrapper });

        expect(result.current).toHaveProperty('executeGet');
        expect(result.current).toHaveProperty('executePost');
        expect(result.current).toHaveProperty('loading');
        expect(result.current).toHaveProperty('error');
        expect(result.current).toHaveProperty('setError');
        expect(typeof result.current.executeGet).toBe('function');
        expect(typeof result.current.executePost).toBe('function');
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    test('executeGet with valid endpoint returns data and manages loading state', async () => {
        const { result } = renderHook(() => useApiCall(), { wrapper: TestWrapper });

        expect(result.current.loading).toBe(false);

        let response: unknown;
        let getPromise: Promise<unknown>;

        act(() => {
            getPromise = result.current.executeGet('/api/users');
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            response = await getPromise;
        });

        expect(response).toBeTruthy();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    test('executePost with payload creates data successfully', async () => {
        const payload = { name: 'Test User', email: 'test@example.com' };
        const { result } = renderHook(() => useApiCall(), { wrapper: TestWrapper });

        let response: unknown;
        await act(async () => {
            response = await result.current.executePost('/api/users', payload);
        });

        expect(response).toBeTruthy();
        expect(result.current.error).toBeNull();
    });

    test('executePost without payload creates data successfully', async () => {
        const { result } = renderHook(() => useApiCall(), { wrapper: TestWrapper });

        let response: unknown;
        await act(async () => {
            response = await result.current.executePost('/api/users');
        });

        expect(response).toBeTruthy();
        expect(result.current.error).toBeNull();
    });

    test('executeGet with error endpoint returns null and sets error state', async () => {
        const { result } = renderHook(() => useApiCall(), { wrapper: TestWrapper });

        let response: unknown;
        await act(async () => {
            response = await result.current.executeGet('/api/error');
        });

        expect(response).toBeNull();
        expect(result.current.error).toBe('Server error');
        expect(result.current.loading).toBe(false);
    });

    test('error state on failed call resets on successful call', async () => {
        const { result } = renderHook(() => useApiCall(), { wrapper: TestWrapper });

        // First call with error
        await act(async () => {
            await result.current.executeGet('/api/error');
        });

        expect(result.current.error).toBe('Server error');

        // Second call should reset error
        await act(async () => {
            await result.current.executeGet('/api/users');
        });

        expect(result.current.error).toBeNull();
    });

    test('setError with custom message updates error state', () => {
        const { result } = renderHook(() => useApiCall(), { wrapper: TestWrapper });

        act(() => {
            result.current.setError('Custom error message');
        });

        expect(result.current.error).toBe('Custom error message');
    });

    test('network error in request sets error message correctly', async () => {
        server.use(
            http.get('*/api/users', () => {
                throw new Error('Network failure');
            })
        );

        const { result } = renderHook(() => useApiCall(), { wrapper: TestWrapper });

        let response: unknown;
        await act(async () => {
            response = await result.current.executeGet('/api/users');
        });

        expect(response).toBeNull();
        expect(result.current.error).toBe('Network failure');
    });
});
