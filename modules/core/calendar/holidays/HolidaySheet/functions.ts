import { isAxiosError } from "axios";

import CALENDAR_API from "@/constants/api/calendar";
import apiClient from "@/lib/api-client";

import type { HolidaySheetFormState } from "./models";

export const getDefaultHolidaySheetForm = (): HolidaySheetFormState => ({
  path: "",
});

export const syncHolidays = async (form: HolidaySheetFormState) => {
  const response = await apiClient.post(CALENDAR_API.HOLIDAY_FETCH, {
    path: form.path.trim(),
  });

  return response.data;
};

export const getHolidaySyncErrorMessage = (error: unknown) => {
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

  return "Failed to sync holidays.";
};
