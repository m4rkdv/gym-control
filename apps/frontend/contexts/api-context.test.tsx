import { renderHook } from '@testing-library/react';
import { useApi } from './api-context';
import { describe, expect, test } from 'vitest';

describe('ApiContext', () => {
  test('throws error when used outside ApiProvider', () => {
    expect(() => {
      renderHook(() => useApi());
    }).toThrow('useApi must be used within an ApiProvider');
  });
});