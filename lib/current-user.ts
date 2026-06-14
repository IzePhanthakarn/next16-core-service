import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth-token";
import { getApiBaseUrl } from "@/lib/api-url";

export type UserProfile = Record<string, unknown>;

type ApiResponse<T> = {
  data?: T;
  message: string;
};

export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const response = await fetch(`${getApiBaseUrl()}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new Error("Failed to load current user.");
  }

  const responseData = (await response.json()) as ApiResponse<UserProfile>;

  if (!responseData.data) {
    throw new Error(
      responseData.message || "Current user data was not returned."
    );
  }

  return responseData.data;
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
