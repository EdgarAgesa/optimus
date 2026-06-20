import { renderHook, act } from '@testing-library/react';

jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithPassword: jest.fn(() => Promise.resolve({ data: { session: { user: {} } }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

import { supabase } from '../supabase';
import { useAdminAuth } from './useAdminAuth';

let authCb;
beforeEach(() => {
  jest.clearAllMocks();
  supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
  supabase.auth.onAuthStateChange.mockImplementation((cb) => {
    authCb = cb;
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  });
});

test('starts unauthenticated when there is no session', async () => {
  const { result } = renderHook(() => useAdminAuth());
  await act(async () => {}); // flush getSession
  expect(result.current.authed).toBe(false);
});

test('rehydrates an existing session on mount', async () => {
  supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } });
  const { result } = renderHook(() => useAdminAuth());
  await act(async () => {});
  expect(result.current.authed).toBe(true);
});

test('flips authed true when a session arrives via onAuthStateChange', async () => {
  const { result } = renderHook(() => useAdminAuth());
  await act(async () => {});
  expect(result.current.authed).toBe(false);
  await act(async () => { authCb('SIGNED_IN', { user: { id: 'u1' } }); });
  expect(result.current.authed).toBe(true);
});

test('login calls signInWithPassword with email + password', async () => {
  const { result } = renderHook(() => useAdminAuth());
  await act(async () => {});
  await act(async () => { await result.current.login('a@b.com', 'pw'); });
  expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pw' });
});

test('logout calls signOut and clears authed', async () => {
  supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } });
  const { result } = renderHook(() => useAdminAuth());
  await act(async () => {});
  expect(result.current.authed).toBe(true);
  await act(async () => { await result.current.logout(); authCb('SIGNED_OUT', null); });
  expect(supabase.auth.signOut).toHaveBeenCalled();
  expect(result.current.authed).toBe(false);
});
