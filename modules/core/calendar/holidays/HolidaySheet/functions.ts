import CALENDAR_API from "@/constants/api/calendar";
import apiClient from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";

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

export const getHolidaySyncErrorMessage = (error: unknown) =>
  getApiErrorMessage(error, "Failed to sync holidays.");
