"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { UilCalendarAlt } from "@/assets/icons/UilCalendarAlt";
import { UilSearch } from "@/assets/icons/UilSearch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { monthOptions, yearOption } from "@/constants/datetime";
import { cn } from "@/lib/utils";

import {
  getCalendarEvents,
  getCalendarEventsErrorMessage,
  getCalendarMonth,
  getMonthRangeLabel,
  getMonthTitle,
  getNextMonth,
  getPreviousMonth,
} from "./functions";
import {
  emptyCalendarEvents,
  type CalendarEventsData,
  type CalendarEvent,
  type CalendarEventTag,
  calendarEventTagClassNames,
  calendarEventTagOptions,
  calendarWeekdays,
} from "./models";
import { UilAngleLeft } from "@/assets/icons/UilAngleLeft";
import { UilAngleRight } from "@/assets/icons/UilAngleRight";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import PAGE_ROUTE from "@/constants/page_route";
import { useRouter } from "next/navigation";
import { EventSheet } from "./EventSheet";
import type { EventSheetMode } from "./EventSheet/models";

type CalendarFilterState = {
  month: string;
  tag: CalendarEventTag | "all";
  year: string;
};

const getDefaultFilters = (): CalendarFilterState => {
  const today = new Date();

  return {
    month: (today.getMonth() + 1).toString().padStart(2, "0"),
    tag: "all",
    year: today.getFullYear().toString(),
  };
};

const defaultFilters = getDefaultFilters();

const getVisibleMonthFromFilters = (filters: CalendarFilterState) =>
  new Date(Number(filters.year), Number(filters.month) - 1, 1);

const buildFilterQuery = (filters: CalendarFilterState) => ({
  month: Number(filters.month),
  ...(filters.tag !== "all" ? { tag: filters.tag } : {}),
  year: Number(filters.year),
});

const getFiltersFromDate = (
  date: Date,
  tag: CalendarFilterState["tag"],
): CalendarFilterState => ({
  month: (date.getMonth() + 1).toString().padStart(2, "0"),
  tag,
  year: date.getFullYear().toString(),
});

const useCalendarEvents = () => {
  const [events, setEvents] =
    useState<CalendarEventsData>(emptyCalendarEvents);
  const [filters, setFilters] = useState<CalendarFilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<CalendarFilterState>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const visibleMonth = useMemo(
    () => getVisibleMonthFromFilters(appliedFilters),
    [appliedFilters],
  );
  const query = useMemo(
    () => buildFilterQuery(appliedFilters),
    [appliedFilters],
  );

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getCalendarEvents(query);
        setEvents(data);
      } catch (error) {
        setEvents(emptyCalendarEvents);
        setErrorMessage(getCalendarEventsErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadEvents();
  }, [query]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const goToMonth = (date: Date) => {
    const nextFilters = getFiltersFromDate(date, appliedFilters.tag);

    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
  };

  const refreshEvents = () => setAppliedFilters((prev) => ({ ...prev }));

  return {
    errorMessage,
    events,
    filters,
    goToMonth,
    handleSearch,
    isLoading,
    refreshEvents,
    setFilters,
    visibleMonth,
  };
};

type EventSheetState = {
  open: boolean;
  mode: EventSheetMode;
  event?: CalendarEvent;
};

export const CalendarPage = () => {
  const router = useRouter();
  const {
    errorMessage,
    events,
    filters,
    goToMonth,
    handleSearch,
    isLoading,
    refreshEvents,
    setFilters,
    visibleMonth,
  } = useCalendarEvents();
  const calendarDays = useMemo(
    () => getCalendarMonth(visibleMonth, events.items),
    [events.items, visibleMonth],
  );
  const eventCount = events.total_events;
  const [eventSheet, setEventSheet] = useState<EventSheetState>({
    open: false,
    mode: "create",
    event: undefined,
  });
  let calendarContent: ReactNode;

  if (isLoading) {
    calendarContent = (
      <div className="flex min-h-114 items-center justify-center px-4 py-6 text-sm text-muted-foreground">
        <LineMdLoadingLoop className="h-9 w-9" />
      </div>
    );
  } else if (errorMessage) {
    calendarContent = (
      <div className="flex min-h-114 items-center justify-center px-4 py-6 text-sm text-destructive">
        {errorMessage}
      </div>
    );
  } else {
    calendarContent = (
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => (
          <div
            className={cn(
              "min-h-30 border-r border-b bg-background p-2 last:border-r-0 sm:min-h-34 lg:min-h-38",
              !day.isCurrentMonth && "bg-muted/20 text-muted-foreground",
            )}
            key={day.key}
          >
            <div className="mb-2 flex h-7 items-center">
              <span
                className={cn(
                  "flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold",
                  day.isToday &&
                    "bg-foreground text-background dark:bg-foreground dark:text-background",
                  !day.isToday &&
                    !day.isCurrentMonth &&
                    "font-medium text-muted-foreground/70",
                )}
              >
                {day.dayOfMonth}
              </span>
            </div>

            <div className="space-y-1">
              {day.events.slice(0, 3).map((event) => (
                <button
                  className={cn(
                    "flex h-8 min-w-0 w-full items-center gap-2 rounded-md border px-2 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity",
                    calendarEventTagClassNames[event.tag],
                  )}
                  key={event.id}
                  onClick={() => setEventSheet({ open: true, mode: "view", event })}
                  title={event.title}
                  type="button"
                >
                  <span className="truncate">{event.title}</span>
                  {event.time ? (
                    <span className="ml-auto shrink-0 tabular-nums">
                      {event.time}
                    </span>
                  ) : null}
                </button>
              ))}
              {day.events.length > 3 ? (
                <div className="px-1 text-xs font-medium text-muted-foreground">
                  {day.events.length - 3} more...
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UilCalendarAlt className="h-9 w-9 text-primary" />
            <h1 className="text-2xl font-semibold">Calendar</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Plan and review events in a monthly calendar.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="w-fit border-2 border-border dark:border-input"
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => router.push(PAGE_ROUTE.CALENDAR.HOLIDAY)}
          >
            Holidays
          </Button>
          <Button
            className="w-fit font-medium"
            type="button"
            variant="success"
            size="lg"
            onClick={() => setEventSheet({ open: true, mode: "create", event: undefined })}
          >
            <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
            Add
          </Button>
        </div>
      </div>

      <Separator />

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex flex-col gap-4 border-b px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 overflow-hidden rounded-lg border bg-background text-center shadow-sm">
              <div className="flex items-center justify-center bg-foreground text-xs font-semibold uppercase text-background">
                {new Intl.DateTimeFormat("en-US", { month: "short" }).format(
                  new Date(),
                )}
              </div>
              <div className="flex items-center justify-center text-2xl font-semibold">
                {new Date().getDate()}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">
                  {getMonthTitle(visibleMonth)}
                </h2>
                <span className="rounded-md border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                  {eventCount} events
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Button
                  aria-label="Previous month"
                  onClick={() => goToMonth(getPreviousMonth(visibleMonth))}
                  size="icon-sm"
                  type="button"
                  variant="outline"
                >
                  <UilAngleLeft aria-hidden="true" />
                </Button>
                <span>{getMonthRangeLabel(visibleMonth)}</span>
                <Button
                  aria-label="Next month"
                  onClick={() => goToMonth(getNextMonth(visibleMonth))}
                  size="icon-sm"
                  type="button"
                  variant="outline"
                >
                  <UilAngleRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          <form
            className="grid gap-3 sm:grid-cols-[120px_120px_160px_auto] sm:items-end"
            onSubmit={handleSearch}
          >
            <div className="grid gap-2">
              <Label htmlFor="calendar-year">Year</Label>
              <Select
                onValueChange={(year) =>
                  setFilters((value) => ({
                    ...value,
                    year,
                  }))
                }
                value={filters.year}
              >
                <SelectTrigger
                  className="h-9 min-h-9 w-full"
                  id="calendar-year"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {yearOption.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="calendar-month">Month</Label>
              <Select
                onValueChange={(month) =>
                  setFilters((value) => ({
                    ...value,
                    month,
                  }))
                }
                value={filters.month}
              >
                <SelectTrigger
                  className="h-9 min-h-9 w-full"
                  id="calendar-month"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {monthOptions.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="calendar-tag">Tag</Label>
              <Select
                onValueChange={(tag) =>
                  setFilters((value) => ({
                    ...value,
                    tag: tag as CalendarFilterState["tag"],
                  }))
                }
                value={filters.tag}
              >
                <SelectTrigger
                  className="h-9 min-h-9 w-full"
                  id="calendar-tag"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    <SelectItem value="all">All tags</SelectItem>
                    {calendarEventTagOptions.map((tag) => (
                      <SelectItem key={tag.value} value={tag.value}>
                        {tag.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full sm:w-auto"
              isLoading={isLoading}
              size="lg"
              type="submit"
              variant="info"
            >
              <UilSearch aria-hidden="true" data-icon="inline-start" />
              Search
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-7 border-b bg-muted/40">
          {calendarWeekdays.map((weekday) => (
            <div
              className="flex h-11 items-center justify-center border-r text-sm font-medium text-muted-foreground last:border-r-0"
              key={weekday}
            >
              {weekday}
            </div>
          ))}
        </div>

        {calendarContent}
      </div>

      <EventSheet
        event={eventSheet.event}
        mode={eventSheet.mode}
        onOpenChange={(open) => setEventSheet((prev) => ({ ...prev, open }))}
        onSaved={() => {
          setEventSheet((prev) => ({ ...prev, open: false }));
          refreshEvents();
        }}
        open={eventSheet.open}
      />
    </section>
  );
};
