import { isAxiosError } from "axios";

import WORK_DAYS_API from "@/constants/api/work-days";
import apiClient from "@/lib/api-client";

import type { HolidaySheetFormState } from "./models";

export const getDefaultHolidaySheetForm = (): HolidaySheetFormState => ({
  path: "",
});

export const syncHolidays = async (form: HolidaySheetFormState) => {
  const response = await apiClient.post(WORK_DAYS_API.HOLIDAY_FETCH, {
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
