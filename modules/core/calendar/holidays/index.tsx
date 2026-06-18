"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { UilCalendarAlt } from "@/assets/icons/UilCalendarAlt";
import { UilSearch } from "@/assets/icons/UilSearch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import PAGE_ROUTE from "@/constants/page_route";
import { cn } from "@/lib/utils";

import {
  formatHolidayDayLabel,
  getHolidays,
  getHolidaysErrorMessage,
  groupHolidaysByMonth,
  MONTH_NAMES,
} from "./functions";
import { HolidaySheet } from "./HolidaySheet";
import type { HolidayData } from "./models";
import { UilSync } from "@/assets/icons/UilSync";

const AVAILABLE_YEARS = [2026, 2027];
const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_YEAR = AVAILABLE_YEARS.includes(CURRENT_YEAR)
  ? CURRENT_YEAR
  : (AVAILABLE_YEARS[0] ?? CURRENT_YEAR);

const useHolidays = () => {
  const [selectedYear, setSelectedYear] = useState(DEFAULT_YEAR);
  const [pendingYear, setPendingYear] = useState(DEFAULT_YEAR);
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState<HolidayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await getHolidays(selectedYear);
        setData(result);
      } catch (error) {
        setErrorMessage(getHolidaysErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [selectedYear, reloadKey]);

  const handleSearch = () => {
    setSelectedYear(pendingYear);
  };

  const reload = () => setReloadKey((k) => k + 1);

  return {
    data,
    errorMessage,
    handleSearch,
    isLoading,
    pendingYear,
    reload,
    setPendingYear,
  };
};

export const HolidaysPage = () => {
  const {
    data,
    errorMessage,
    handleSearch,
    isLoading,
    pendingYear,
    reload,
    setPendingYear,
  } = useHolidays();

  const groupedHolidays = data ? groupHolidaysByMonth(data.items) : {};
  const sortedMonths = Object.keys(groupedHolidays)
    .map(Number)
    .sort((a, b) => a - b);
  const totalHolidaysThisYear = data?.stats.total_holidays_this_year ?? 0;
  const remainingHolidaysThisYear =
    data?.stats.remaining_holidays_this_year ?? 0;
  const completedHolidaysThisYear = Math.max(
    totalHolidaysThisYear - remainingHolidaysThisYear,
    0,
  );
  const remainingHolidayProgress =
    totalHolidaysThisYear > 0
      ? Math.round((remainingHolidaysThisYear / totalHolidaysThisYear) * 100)
      : 0;
  const nextHoliday = data?.stats.next_upcoming_holiday;
  const nextHolidayDateLabel = nextHoliday
    ? new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(nextHoliday.holiday_date))
    : "";

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UilCalendarAlt className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-semibold">Public Holidays</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Annual public holidays for financial institutions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="lg" variant="outline">
            <Link href={PAGE_ROUTE.CALENDAR.INDEX}>Back to Calendar</Link>
          </Button>
          <HolidaySheet
            onSynced={reload}
            trigger={
              <Button size="lg" type="button" variant="success">
                <UilSync />
                Sync Holidays
              </Button>
            }
          />
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-end gap-2">
        <Select
          onValueChange={(value) => setPendingYear(Number(value))}
          value={String(pendingYear)}
        >
          <SelectTrigger className="w-30 min-h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_YEARS.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} type="button" variant="info" size="lg">
          <UilSearch aria-hidden="true" data-icon="inline-start" />
          Search
        </Button>
      </div>

      {data && (
        <div className="grid gap-3 lg:grid-cols-8">
          <div className="flex min-h-32 flex-col justify-between rounded-lg border bg-card p-4 lg:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Holiday Overview
                </p>
              </div>
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <UilCalendarAlt className="h-5 w-5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <p className="text-3xl font-semibold tabular-nums">
                  {totalHolidaysThisYear}
                </p>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  this year
                </p>
              </div>
              <div className="min-w-0 border-l pl-4">
                <p className="text-3xl font-semibold tabular-nums">
                  {data.stats.total_holidays_this_month}
                </p>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  this month
                </p>
              </div>
            </div>
          </div>
          <div className="flex min-h-32 flex-col justify-between rounded-lg border bg-card p-4 col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Remaining Holidays
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {remainingHolidaysThisYear}/{totalHolidaysThisYear} Days
                </p>
              </div>
              <span className="text-lg font-semibold text-primary">
                {remainingHolidayProgress}%
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Progress
                aria-label="Remaining holidays progress"
                className={cn(
                  "h-2 w-full",
                  "**:data-[slot=progress-indicator]:bg-primary",
                )}
                value={remainingHolidayProgress}
              />
              <div className="flex items-center justify-between text-xs font-medium uppercase text-muted-foreground">
                <span>{completedHolidaysThisYear} days passed</span>
                <span>{remainingHolidaysThisYear} days remaining</span>
              </div>
            </div>
          </div>
          {nextHoliday && (
            <div className="flex min-h-32 flex-col justify-between rounded-lg border bg-card p-4 lg:col-span-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    Next Holiday
                  </p>
                  <p className="mt-1 line-clamp-2 text-base font-semibold">
                    {nextHoliday.holiday_description.trim()}
                  </p>
                </div>
                <div className="shrink-0 rounded-md bg-primary/10 px-3 py-2 text-center text-primary">
                  <p className="text-2xl font-semibold tabular-nums">
                    {nextHoliday.days_until}
                  </p>
                  <p className="text-[10px] font-semibold uppercase leading-none">
                    days
                  </p>
                </div>
              </div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {nextHolidayDateLabel}
              </p>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <LineMdLoadingLoop className="h-10 w-10" />
        </div>
      ) : errorMessage ? (
        <div className="flex h-64 items-center justify-center text-sm text-destructive">
          {errorMessage}
        </div>
      ) : (
        <div className="flex flex-col gap-8 pb-8">
          {sortedMonths.map((month) => (
            <div key={month}>
              <h2 className="mb-3 text-xl font-semibold">
                {MONTH_NAMES[month]}
              </h2>
              <div className="flex flex-col gap-2">
                {groupedHolidays[month].map((holiday) => (
                  <div
                    className="flex overflow-hidden rounded-lg border bg-card"
                    key={holiday.id}
                  >
                    <div className="w-1 shrink-0 bg-primary" />
                    <div className="flex flex-1 items-start gap-6 px-4 py-3">
                      <span className="w-36 shrink-0 text-sm text-muted-foreground">
                        {formatHolidayDayLabel(holiday.holiday_date)}
                      </span>
                      <span className="text-sm font-medium">
                        {holiday.holiday_description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
