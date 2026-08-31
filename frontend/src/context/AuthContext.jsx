import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { supabase, signOutSupabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pharmavision_token'));
  const [loading, setLoading] = useState(true);

  // Initial Auth Check & Supabase Session Sync
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // 1. Check existing backend token
      if (token) {
        try {
          const res = await api.getProfile();
          if (isMounted) setUser(res.user);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }

      // 2. Check and sync Supabase Auth session if active
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && (!token || !user)) {
            const supaUser = session.user;
            const googleProfile = {
              email: supaUser.email,
              name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0] || 'User',
              picture: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || null,
              googleId: supaUser.id
            };

            try {
              const res = await api.loginWithGoogle(googleProfile);
              if (isMounted) {
                localStorage.setItem('pharmavision_token', res.token);
                setToken(res.token);
                setUser(res.user);
              }
            } catch (syncErr) {
              if (isMounted) {
                localStorage.setItem('pharmavision_token', session.access_token);
                setToken(session.access_token);
                setUser({
                  id: supaUser.id,
                  name: googleProfile.name,
                  email: googleProfile.email
                });
              }
            }
          }
        } catch (supaErr) {
          console.warn('[Supabase Auth] Session retrieval notice:', supaErr.message);
        }
      }

      if (isMounted) setLoading(false);
    }

    initAuth();

    // 3. Listen for Supabase Auth State changes (OAuth redirects & sign-ins)
    let authSubscription = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          const supaUser = session.user;
          const googleProfile = {
            email: supaUser.email,
            name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0] || 'User',
            picture: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || null,
            googleId: supaUser.id
          };

          try {
            const res = await api.loginWithGoogle(googleProfile);
            if (isMounted) {
              localStorage.setItem('pharmavision_token', res.token);
              setToken(res.token);
              setUser(res.user);
            }
          } catch (syncErr) {
            if (isMounted) {
              localStorage.setItem('pharmavision_token', session.access_token);
              setToken(session.access_token);
              setUser({
                id: supaUser.id,
                name: googleProfile.name,
                email: googleProfile.email
              });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            localStorage.removeItem('pharmavision_token');
            setToken(null);
            setUser(null);
          }
        }
      });
      authSubscription = data.subscription;
    }

    return () => {
      isMounted = false;
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('pharmavision_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.register(name, email, password);
    localStorage.setItem('pharmavision_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const loginWithGoogle = async (googleData) => {
    const res = await api.loginWithGoogle(googleData);
    localStorage.setItem('pharmavision_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = async () => {
    await signOutSupabase();
    localStorage.removeItem('pharmavision_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

