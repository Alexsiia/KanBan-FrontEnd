import axios, { AxiosError } from "axios";

const BASE_URL = "http://alexsia.flashnetbrasil.com.br/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// ─── Token helpers ────────────────────────────────────────────────────────────

function getAccessToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;
}

function getRefreshToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("refresh_token")
    : null;
}

function getTokenExpiry(): number | null {
  if (typeof window === "undefined") return null;
  const expiry = localStorage.getItem("token_expiry");
  return expiry ? parseInt(expiry, 10) : null;
}

function isTokenExpiringSoon(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) return false;
  // Refresh if less than 5 minutes remain
  return Date.now() >= expiry - 5 * 60 * 1000;
}

function clearAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("user");
  }
}

export function saveTokens(accessToken: string, refreshToken?: string, expiresIn = 3600): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", accessToken);
  if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
  // Store absolute expiry timestamp
  localStorage.setItem("token_expiry", String(Date.now() + expiresIn * 1000));
}

// ─── Refresh logic (shared across concurrent requests) ───────────────────────

let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function doRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await axios.post(`${BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  });

  const newToken: string = res.data.access_token;
  const expiresIn: number = res.data.expires_in ?? 3600;
  saveTokens(newToken, undefined, expiresIn);
  api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
  return newToken;
}

// ─── Request interceptor: attach token + proactive refresh ───────────────────

api.interceptors.request.use(async (config) => {
  // Skip auth endpoints to avoid infinite loops
  const isAuthEndpoint = config.url?.startsWith("/auth/");
  if (isAuthEndpoint) return config;

  // Proactively refresh if the token is about to expire
  if (isTokenExpiringSoon() && !isRefreshing) {
    isRefreshing = true;
    try {
      const newToken = await doRefresh();
      config.headers.Authorization = `Bearer ${newToken}`;
    } catch {
      clearAuth();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(new Error("Session expired"));
    } finally {
      isRefreshing = false;
    }
    return config;
  }

  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor: reactive refresh on 401 ───────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers!.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await doRefresh();
        processQueue(null, newToken);
        originalRequest.headers!.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
