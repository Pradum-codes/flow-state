"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, loginUser, registerUser } from "@/services/auth";

const STORAGE_KEY = "flowstate_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrapAuth() {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      setToken(saved);
      try {
        const res = await getMe(saved);
        setUser(res.user);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      }
    }

    bootstrapAuth().finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const res = await loginUser(credentials);
    window.localStorage.setItem(STORAGE_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  }

  async function register(payload) {
    const res = await registerUser(payload);
    window.localStorage.setItem(STORAGE_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
