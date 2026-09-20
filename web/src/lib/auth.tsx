"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, TOKEN_KEY, USER_KEY } from "./api";

interface AuthState {
  user: string | null;
  ready: boolean;
  login: (u: string, p: string) => Promise<void>;
  register: (u: string, p: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(localStorage.getItem(USER_KEY));
    setReady(true);
  }, []);

  function persist(token: string, username: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, username);
    setUser(username);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        async login(u, p) {
          const r = await api.login(u, p);
          persist(r.access_token, r.username);
        },
        async register(u, p) {
          const r = await api.register(u, p);
          persist(r.access_token, r.username);
        },
        logout() {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
