import { renderHook, act } from '@testing-library/react';
import { useApi, ApiProvider } from './api-context';
import { AuthProvider } from './auth-context';
import { describe, expect, test, vi } from 'vitest';
import React, { ReactNode } from 'react';
import { server } from '@/_test/setup';
import { http, HttpResponse } from 'msw';

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