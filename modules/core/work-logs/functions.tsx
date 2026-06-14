import { isAxiosError } from "axios";

import {
  moodScoreOptions,
  productivityScoreOptions,
} from "@/constants/worklogs";
import apiClient from "@/lib/api-client";

import {
  type CreateWorkLogInput,
  type UpdateWorkLogInput,
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

type UpdateWorkLogResponse = CreateWorkLogResponse;

type DeleteWorkLogResponse = {
  status: string;
  code: number;
  message: string;
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

const getScoreOptionLabel = (
  options: readonly { value: string; label: string }[],
  value: number
) => options.find((option) => option.value === value.toString())?.label || value.toString();

export const getMoodScoreLabel = (value: number) =>
  getScoreOptionLabel(moodScoreOptions, value);

export const getProductivityScoreLabel = (value: number) =>
  getScoreOptionLabel(productivityScoreOptions, value);

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

export const updateWorkLog = async (id: string, input: UpdateWorkLogInput) => {
  const response = await apiClient.put<UpdateWorkLogResponse>(
    `/work-logs/${id}`,
    input
  );

  return response.data.data;
};

export const deleteWorkLog = async (id: string) => {
  const response = await apiClient.delete<DeleteWorkLogResponse>(
    `/work-logs/${id}`
  );

  return response.data;
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
