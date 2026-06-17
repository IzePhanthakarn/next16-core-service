import { isAxiosError } from "axios";

import WORK_DAYS_API from "@/constants/api/work-days";
import apiClient from "@/lib/api-client";

import type { WorkDayEvent } from "../models";
import type { CreateEventPayload, EventSheetFormState, EventSheetMode } from "./models";

export const getDefaultEventSheetForm = (): EventSheetFormState => ({
  title: "",
  description: "",
  startDate: new Date(),
  startTime: "09:00",
  endDate: new Date(),
  endTime: "18:00",
  tag: "",
});

export const getEventSheetTitle = (mode: EventSheetMode): string => {
  if (mode === "view") return "View event";
  if (mode === "edit") return "Edit event";
  return "Add event";
};

const formatDateTimeForApi = (date: Date, time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(hours ?? 0, minutes ?? 0, 0, 0);

  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");

  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const tzHours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, "0");
  const tzMins = (Math.abs(offset) % 60).toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hh}:${mm}:00${sign}${tzHours}:${tzMins}`;
};

const parseEventDateTime = (isoString?: string): { date?: Date; time: string } => {
  if (!isoString) return { date: undefined, time: "00:00" };
  const d = new Date(isoString);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return { date: d, time: `${hh}:${mm}` };
};

export const getEventSheetFormFromEvent = (event?: WorkDayEvent): EventSheetFormState => {
  if (!event) return getDefaultEventSheetForm();

  const start = parseEventDateTime(event.start_date);
  const end = parseEventDateTime(event.end_date);

  return {
    title: event.title,
    description: event.description ?? "",
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    tag: event.tag,
  };
};

export const buildEventSheetPayload = (form: EventSheetFormState): CreateEventPayload => {
  if (!form.startDate || !form.endDate) {
    throw new Error("Start date and end date are required.");
  }

  return {
    description: form.description.trim() || null,
    end_date: formatDateTimeForApi(form.endDate, form.endTime),
    start_date: formatDateTimeForApi(form.startDate, form.startTime),
    tag: form.tag,
    title: form.title.trim(),
  };
};

export const createWorkDayEvent = async (payload: CreateEventPayload) => {
  const response = await apiClient.post(WORK_DAYS_API.EVENTS, payload);
  return response.data;
};

export const updateWorkDayEvent = async (id: string, payload: CreateEventPayload) => {
  const response = await apiClient.put(`${WORK_DAYS_API.EVENTS}/${id}`, payload);
  return response.data;
};

export const getEventSheetErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message
    );
  }

  if (error instanceof Error) return error.message;

  return "Failed to save event.";
};

export const formatDatePickerLabel = (date?: Date): string =>
  date
    ? new Intl.DateTimeFormat("en-EN", { dateStyle: "medium" }).format(date)
    : "Select date";
