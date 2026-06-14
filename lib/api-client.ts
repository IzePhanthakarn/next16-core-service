import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";

import AUTH_API from "@/constants/api/auth";
import { getApiBaseUrl } from "@/lib/api-url";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  clearAuthCookies,
  getBrowserCookie,
  REFRESH_TOKEN_COOKIE_NAME,
  setAuthCookies,
  type AuthTokenResponse,
} from "@/lib/auth-token";

type ApiResponse<T> = {
  data?: T;
  message?: string;
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const baseURL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});

const refreshClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});

let refreshPromise: Promise<AuthTokenResponse> | null = null;

const refreshAccessToken = async () => {
  const refreshToken = getBrowserCookie(REFRESH_TOKEN_COOKIE_NAME);

  if (!refreshToken) {
    throw new Error("Refresh token is not available.");
  }

  refreshPromise ??= refreshClient
    .post<ApiResponse<AuthTokenResponse>>(AUTH_API.REFRESH, {
      refresh_token: refreshToken,
    })
    .then((response) => {
      const authData = response.data.data;

      if (!authData?.access_token) {
        throw new Error("Refresh success, but access token was not returned.");
      }

      setAuthCookies({
        ...authData,
        refresh_token: authData.refresh_token || refreshToken,
      });

      return authData;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

if (typeof window !== "undefined") {
  apiClient.interceptors.request.use((config) => {
    const token = getBrowserCookie(ACCESS_TOKEN_COOKIE_NAME);

    if (!token) {
      return config;
    }

    const headers = AxiosHeaders.from(config.headers);

    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    config.headers = headers;

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetriableRequestConfig | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        originalRequest.url === AUTH_API.REFRESH
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const authData = await refreshAccessToken();
        const headers = AxiosHeaders.from(originalRequest.headers);

        headers.set("Authorization", `Bearer ${authData.access_token}`);
        originalRequest.headers = headers;

        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuthCookies();

        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }

        return Promise.reject(refreshError);
      }
    }
  );
}

export default apiClient;
