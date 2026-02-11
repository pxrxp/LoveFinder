import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { apiFetch } from '@/services/api';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthUser {
  user_id: string,
  email: string,
  full_name: string,
  gender: string,
  sexual_orientation: string,
  birth_date: Date,
  bio: string,
  created_at: Date,
  latitude: number,
  longitude: number,
  pref_genders: string,
  pref_min_age: number,
  pref_max_age: number,
  pref_distance_radius_km: number,
  is_active: boolean,
  allow_messages_from_strangers: boolean
};

interface AuthContextValue {
  user: AuthUser | null,
  login: (email: string, password: string) => void,
  logout: () => void,
  loading: boolean,
};

export const AuthProvider = ({ children }: {children: ReactNode}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await apiFetch('users/me');
      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await apiFetch('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await checkAuth();
  };

  const logout = async () => {
    await apiFetch('auth/logout', { method: 'POST' });
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

