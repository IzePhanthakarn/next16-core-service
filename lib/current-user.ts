import { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import AUTH_API from "@/constants/api/auth";
import apiClient from "@/lib/api-client";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  type AuthTokenResponse,
} from "@/lib/auth-token";

export type UserProfile = Record<string, unknown>;

type ApiResponse<T> = {
  data?: T;
  message: string;
};

const getCurrentUserWithToken = async (token: string) => {
  const response = await apiClient.get<ApiResponse<UserProfile>>("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.data.data) {
    throw new Error(
      response.data.message || "Current user data was not returned."
    );
  }

  return response.data.data;
};

const refreshAccessToken = async (refreshToken: string) => {
  const response = await apiClient.post<ApiResponse<AuthTokenResponse>>(
    AUTH_API.REFRESH,
    {
      refresh_token: refreshToken,
    }
  );

  return response.data.data?.access_token || "";
};

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (!token && !refreshToken) {
    redirect("/login");
  }

  if (token) {
    try {
      return await getCurrentUserWithToken(token);
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 401) {
        throw new Error("Failed to load current user.");
      }
    }
  }

  if (!refreshToken) {
    redirect("/login");
  }

  try {
    const refreshedToken = await refreshAccessToken(refreshToken);

    if (!refreshedToken) {
      redirect("/login");
    }

    return await getCurrentUserWithToken(refreshedToken);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      redirect("/login");
    }

    throw new Error("Failed to load current user.");
  }
});

export const formatUserValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const getStringValue = (user: UserProfile, keys: string[]) => {
  for (const key of keys) {
    const value = user[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

export const getUserDisplayName = (user: UserProfile) =>
  getStringValue(user, ["name", "fullName", "username", "email"]) || "User";

export const getUserEmail = (user: UserProfile) =>
  getStringValue(user, ["email", "emailAddress"]);

export const getUserAvatarUrl = (user: UserProfile) =>
  getStringValue(user, ["avatar", "avatarUrl", "image", "imageUrl", "photo"]);

export const getUserInitials = (user: UserProfile) => {
  const displayName = getUserDisplayName(user);
  const nameParts = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (nameParts.length > 1) {
    return nameParts.map((part) => part[0]).join("").toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase();
};
