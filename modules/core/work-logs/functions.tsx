import { isAxiosError } from "axios";

import apiClient from "@/lib/api-client";

import {
  type CreateWorkLogInput,
  type WorkLog,
  type WorkLogsQuery,
  type WorkLogsResponse,
} from "./models";

type CreateWorkLogResponse = {
  status: string;
  code: number;
  message: string;
  data: WorkLog;
};

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

export const getWorkLogs = async (query: WorkLogsQuery = {}) => {
  const response = await apiClient.get<WorkLogsResponse>("/work-logs", {
    params: query,
  });

  return response.data.data;
};

export const createWorkLog = async (input: CreateWorkLogInput) => {
  const response = await apiClient.post<CreateWorkLogResponse>(
    "/work-logs",
    input
  );

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
