import { isAxiosError } from "axios";

import apiClient from "@/lib/api-client";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth-token";

import { type WorkLogsQuery, type WorkLogsResponse } from "./models";

export const formatWorkLogDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-EN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const formatWorkLogDate = (value: string) =>
  new Intl.DateTimeFormat("en-EN", {
    dateStyle: "medium",
  }).format(new Date(value));

export const formatWorkLogTime = (value: string) =>
  new Intl.DateTimeFormat("en-EN", {
    timeStyle: "short",
  }).format(new Date(value));

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") {
    return "";
  }

  return (
    document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${name}=`))
      ?.split("=")[1] || ""
  );
};

export const getWorkLogs = async (query: WorkLogsQuery = {}) => {
  const token = decodeURIComponent(getCookieValue(ACCESS_TOKEN_COOKIE_NAME));

  if (!token) {
    throw new Error("Unauthorized");
  }

  const response = await apiClient.get<WorkLogsResponse>("/work-logs", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: query,
  });

  return response.data.data;
};

export const getWorkLogsErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to load work logs.";
};
