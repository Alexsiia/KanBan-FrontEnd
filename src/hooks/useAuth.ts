"use client";

import { useEffect, useState, useCallback } from "react";
import { login as loginService, logout as logoutService, getMe } from "@/services/auth";
import { saveTokens } from "@/services/api";
import { User } from "@/types";
import { AxiosError } from "axios";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (token) {
      getMe()
        .then((u) => {
          setUser(u);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("token_expiry");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (
      username: string,
      password: string
    ): Promise<{ success: boolean; message?: string }> => {
      try {
        const data = await loginService(username, password);

        // Save tokens with proper expiry tracking (RF-02)
        saveTokens(data.access_token, data.refresh_token, data.expires_in);
        localStorage.setItem("user", JSON.stringify(data.user));

        setUser(data.user);
        setIsAuthenticated(true);

        return { success: true };
      } catch (error) {
        const err = error as AxiosError;
        const status = err.response?.status;

        if (status === 403)
          return {
            success: false,
            message: "Usuário inativo. Entre em contato com o administrador.",
          };
        if (status === 401)
          return { success: false, message: "Usuário ou senha inválidos." };

        return { success: false, message: "Erro ao fazer login. Tente novamente." };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_expiry");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = "/login";
    }
  }, []);

  return { user, isAuthenticated, loading, login, logout };
}
