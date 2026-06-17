import { isAxiosError } from "axios";

import WORK_DAYS_API from "@/constants/api/work-days";
import apiClient from "@/lib/api-client";

import type { Holiday, HolidayResponse } from "./models";

export const getHolidays = async (year: number) => {
  const response = await apiClient.get<HolidayResponse>(
    WORK_DAYS_API.HOLIDAYS,
    { params: { year } },
  );

  return response.data.data;
};

export const getHolidaysErrorMessage = (error: unknown) => {
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

  return "Failed to load holidays.";
};

const parseHolidayDate = (dateStr: string): Date => {
  const datePart = dateStr.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const groupHolidaysByMonth = (items: Holiday[]): Record<number, Holiday[]> => {
  const groups: Record<number, Holiday[]> = {};

  for (const item of items) {
    const month = parseHolidayDate(item.holiday_date).getMonth();
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(item);
  }

  return groups;
};

export const formatHolidayDayLabel = (dateStr: string): string => {
  const date = parseHolidayDate(dateStr);
  const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  return `${dayOfWeek} ${date.getDate()}`;
};

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
