import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from './auth-context';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { testData } from '../_test/mocks/auth-handler';
import { http, HttpResponse } from 'msw';
import { server } from '../_test/setup';

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

describe('AuthContext', () => {
  const { validUser, validCredentials } = testData;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('login with valid credentials stores token and user data', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login(validCredentials.userName, validCredentials.password);
    });

    expect(result.current.user?.userName).toBe(validUser.userName);
    expect(result.current.token).toBe('mock-jwt-token');
    expect(result.current.error).toBeNull();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(validUser));
  });

  test('login with invalid credentials sets error state', async () => {
    server.use(
      http.post('*/api/auth/login', () => {
        return HttpResponse.text('Invalid credentials', { status: 401 });
      })
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      try {
        await result.current.login('invalid@email.com', 'wrongpassword');
      } catch {
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.error).toBe('Invalid credentials');
  });

});