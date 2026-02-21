/**
 * Global User Authentication Store.
 * 
 * This provider tracks the 'user' object and 'loading' state.
 * - On startup: It calls the backend to see if the user has an active session.
 * - Login/Logout: Exports simple functions to sign in or sign out, 
 *   which automatically update the 'user' state across the whole app.
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
    try {
      await Auth.login(email, password);
      await refreshUser();
    } catch (e: any) {
      throw e;
    }
  };

  const logout = async () => {
    try {
      await Auth.logout();
    } catch (e) {
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
