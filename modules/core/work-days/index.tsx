"use client";

import { useMemo, useState } from "react";

import { UilCalendarAlt } from "@/assets/icons/UilCalendarAlt";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import {
  getCalendarMonth,
  getMonthRangeLabel,
  getMonthTitle,
  getNextMonth,
  getPreviousMonth,
} from "./functions";
import {
  sampleWorkDayEvents,
  workDayEventToneClassNames,
  workDayWeekdays,
} from "./models";
import { useRouter } from "next/navigation";
import PAGE_ROUTE from "@/constants/page_route";

export const WorkDaysPage = () => {
  const router = useRouter()
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const calendarDays = useMemo(
    () => getCalendarMonth(visibleMonth, sampleWorkDayEvents),
    [visibleMonth],
  );
  const eventCount = sampleWorkDayEvents.filter((event) =>
    event.date.startsWith(
      `${visibleMonth.getFullYear()}-${(visibleMonth.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`,
    ),
  ).length;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UilCalendarAlt className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-semibold">Work Days</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Plan and review work days in a monthly calendar.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="w-fit border-2 border-border dark:border-input"
            type="button"
            variant="secondary"
            onClick={() => router.push(PAGE_ROUTE.WORK_DAYS.HOLIDAY)}
          >
            Holidays
          </Button>
          <Button className="w-fit font-medium" type="button" variant="success">
            <Plus aria-hidden="true" data-icon="inline-start" />
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
                  onClick={() =>
                    setVisibleMonth((month) => getPreviousMonth(month))
                  }
                  size="icon-sm"
                  type="button"
                  variant="outline"
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <span>{getMonthRangeLabel(visibleMonth)}</span>
                <Button
                  aria-label="Next month"
                  onClick={() =>
                    setVisibleMonth((month) => getNextMonth(month))
                  }
                  size="icon-sm"
                  type="button"
                  variant="outline"
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() =>
                setVisibleMonth(
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                )
              }
              type="button"
              variant="outline"
            >
              <CalendarDays aria-hidden="true" data-icon="inline-start" />
              Today
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b bg-muted/40">
          {workDayWeekdays.map((weekday) => (
            <div
              className="flex h-11 items-center justify-center border-r text-sm font-medium text-muted-foreground last:border-r-0"
              key={weekday}
            >
              {weekday}
            </div>
          ))}
        </div>

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
                  <div
                    className={cn(
                      "flex h-8 min-w-0 items-center gap-2 rounded-md border px-2 text-xs font-medium",
                      workDayEventToneClassNames[event.tone],
                    )}
                    key={event.id}
                    title={event.title}
                  >
                    <span className="truncate">{event.title}</span>
                    {event.time ? (
                      <span className="ml-auto shrink-0 tabular-nums">
                        {event.time}
                      </span>
                    ) : null}
                  </div>
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
      </div>
    </section>
  );
};
