import PROPERTY_TYPES from "@/constants/properties";
import apiClient from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";
import { getCachedPropertyOptions } from "@/lib/properties";

import {
  type CreateWorkLogInput,
  type UpdateWorkLogInput,
  type WorkLog,
  type WorkLogsQuery,
  type WorkLogsResponse,
} from "./models";

type WorkLogResponse = {
  status: string;
  code: number;
  message: string;
  data: WorkLog;
};


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

export { formatMediumDate as formatWorkLogDate } from "@/lib/date";

export const formatWorkLogTime = (value: string) =>
  new Intl.DateTimeFormat("en-EN", {
    timeStyle: "short",
  }).format(new Date(value));

const getScoreOptionLabel = (code: string, value: number) => {
  const options = getCachedPropertyOptions(code);
  return options.find((opt) => opt.value === value.toString())?.label ?? value.toString();
};

export const getMoodScoreLabel = (value: number) =>
  getScoreOptionLabel(PROPERTY_TYPES.MOOD_SCORE, value);

export const getProductivityScoreLabel = (value: number) =>
  getScoreOptionLabel(PROPERTY_TYPES.PRODUCTIVITY_SCORE, value);

export const getWorkLogs = async (query: WorkLogsQuery = {}) => {
  const response = await apiClient.get<WorkLogsResponse>("/work-logs", {
    params: query,
  });

  return response.data.data;
};

export const createWorkLog = async (input: CreateWorkLogInput) => {
  const response = await apiClient.post<WorkLogResponse>(
    "/work-logs",
    input
  );

  return response.data.data;
};

export const updateWorkLog = async (id: string, input: UpdateWorkLogInput) => {
  const response = await apiClient.put<WorkLogResponse>(
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

export const getWorkLogsErrorMessage = (error: unknown) =>
  getApiErrorMessage(error, "Failed to load work logs.");
