/**
 * This file keeps track of the logged-in user.
 *
 * It provides the 'user' data to the rest of the app and handles the
 * logic for logging in, logging out, and checking if a session is still active.
 */
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { getMyProfile } from "@/services/users";
import * as Auth from "@/services/auth";
import { UserPrivate } from "@/types/User";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthContextValue {
  user: UserPrivate | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  loading: boolean;
  refreshUser: () => void;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserPrivate | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await getMyProfile();
      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await Auth.login(email, password);
    await refreshUser();
  };

  const logout = async () => {
    try {
      await Auth.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
