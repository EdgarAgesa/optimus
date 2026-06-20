import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

// Owns the real Supabase Auth session for /admin. `authed` derives from a JWT
// session, not a boolean. Mirrors the project's hook pattern (useProducts,
// useAutoplayAllowed) so the auth logic is testable in isolation.
export function useAdminAuth() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    (email, password) => supabase.auth.signInWithPassword({ email, password }),
    []
  );
  const logout = useCallback(() => supabase.auth.signOut(), []);

  return { authed: !!session, login, logout };
}
