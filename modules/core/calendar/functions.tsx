import { isAxiosError } from "axios";

import CALENDAR_API from "@/constants/api/calendar";
import apiClient from "@/lib/api-client";

import { type CalendarCell, type CalendarEvent } from "./models";
import type { CalendarEventsQuery, CalendarEventsResponse } from "./models";
import type { HolidayResponse } from "./holidays/models";

export const getCalendarEvents = async (query: CalendarEventsQuery = {}) => {
  const response = await apiClient.get<CalendarEventsResponse>(
    CALENDAR_API.EVENTS,
    { params: query },
  );

  return response.data.data;
};

export const getCalendarHolidays = async (
  query: CalendarEventsQuery = {},
): Promise<CalendarEvent[]> => {
  const response = await apiClient.get<HolidayResponse>(CALENDAR_API.HOLIDAYS, {
    params: { month: query.month, year: query.year },
  });

  return response.data.data.items.map((holiday) => ({
    id: holiday.id,
    date: holiday.holiday_date.split("T")[0],
    isHoliday: true,
    tag: "coral",
    title: holiday.holiday_description.trim(),
  }));
};

export const getCalendarEventsErrorMessage = (error: unknown) => {
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

  return "Failed to load calendar events.";
};

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const getDateKey = (date: Date) => dateKeyFormatter.format(date);

export const getMonthTitle = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

export const getMonthRangeLabel = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(firstDay)} - ${formatter.format(lastDay)}`;
};

export const getCalendarMonth = (
  visibleMonth: Date,
  events: CalendarEvent[]
): CalendarCell[] => {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(year, month, 1 - firstDay.getDay());
  const endDate = new Date(year, month + 1, lastDay.getDay() === 6 ? 0 : 6 - lastDay.getDay());
  const totalDays =
    Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
  const todayKey = getDateKey(new Date());
  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>(
    (calendarEvents, event) => {
      calendarEvents[event.date] = [...(calendarEvents[event.date] || []), event];
      return calendarEvents;
    },
    {}
  );

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const key = getDateKey(date);

    return {
      date,
      dayOfMonth: date.getDate(),
      events: eventsByDate[key] || [],
      isCurrentMonth: date.getMonth() === month,
      isToday: key === todayKey,
      key,
    };
  });
};

export const getNextMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 1);

export const getPreviousMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() - 1, 1);
