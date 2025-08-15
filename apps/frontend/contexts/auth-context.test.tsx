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

  test('login with network error sets error state', async () => {
    server.use(
      http.post('*/api/auth/login', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      try {
        await result.current.login(validCredentials.userName, validCredentials.password);
      } catch {
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  test('login with server error sets error state', async () => {
    server.use(
      http.post('*/api/auth/login', () => {
        return HttpResponse.text('Internal server error', { status: 500 });
      })
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      try {
        await result.current.login(validCredentials.userName, validCredentials.password);
      } catch {
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.error).toBe('Internal server error');
  });

  test('logout clears authentication data', async () => {
    // Setup initial state
    localStorageMock.getItem
      .mockReturnValueOnce('existing-token')
      .mockReturnValueOnce(JSON.stringify(validUser));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  test('provider initializes with stored token and user data', async () => {
    localStorageMock.getItem
      .mockReturnValueOnce('stored-token')
      .mockReturnValueOnce(JSON.stringify(validUser));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user?.userName).toBe(validUser.userName);
    expect(result.current.token).toBe('stored-token');
  });

  test('provider initializes with no stored data', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  test('provider initializes with invalid stored user data', async () => {
    localStorageMock.getItem
      .mockReturnValueOnce('stored-token')
      .mockReturnValueOnce('invalid-json');

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  test('login clears previous error state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    // First, simulate a failed login
    server.use(
      http.post('*/api/auth/login', () => {
        return HttpResponse.text('First error', { status: 401 });
      })
    );

    await act(async () => {
      try {
        await result.current.login('wrong', 'credentials');
      } catch {
      }
    });

    expect(result.current.error).toBe('First error');

    // Now simulate a successful login with new handler
    server.use(
      http.post('*/api/auth/login', () => {
        return HttpResponse.json({
          user: validUser,
          token: 'mock-jwt-token'
        });
      })
    );

    await act(async () => {
      await result.current.login(validCredentials.userName, validCredentials.password);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.user?.userName).toBe(validUser.userName);
  });

  test('login sets loading state correctly', async () => {
    server.use(
      http.post('*/api/auth/login', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json({
          user: validUser,
          token: 'mock-jwt-token'
        });
      })
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    // Initially not loading after mount
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Start login - should set loading to true
    act(() => {
      result.current.login(validCredentials.userName, validCredentials.password);
    });

    expect(result.current.isLoading).toBe(true);

    // Wait for login to complete - should set loading to false
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user?.userName).toBe(validUser.userName);
  });
});