"use client";

import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  formatWorkLogDate,
  getWorkLogs,
  getWorkLogsErrorMessage,
} from "./functions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { monthOptions, yearOption } from "@/constants/datetime";
import {
  emptyWorkLogs,
  itemPerPageOptions,
  type WorkLogsData,
  type WorkLogsQuery,
} from "./models";
import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";

type WorkLogsFilterState = {
  title: string;
  month: string;
  year: string;
};

const getDefaultFilters = (): WorkLogsFilterState => {
  const today = new Date();

  return {
    title: "",
    month: (today.getMonth() + 1).toString().padStart(2, "0"),
    year: today.getFullYear().toString(),
  };
};

const defaultFilters = getDefaultFilters();

const buildFilterQuery = (filters: WorkLogsFilterState) => ({
  ...(filters.title.trim() ? { title: filters.title.trim() } : {}),
  ...(filters.month.trim() ? { month: filters.month.trim() } : {}),
  ...(filters.year.trim() ? { year: filters.year.trim() } : {}),
});

const useWorkLogs = () => {
  const [workLogs, setWorkLogs] = useState<WorkLogsData>(emptyWorkLogs);
  const [currentPage, setCurrentPage] = useState(emptyWorkLogs.current_page);
  const [itemPerPage, setItemPerPage] = useState<number>(itemPerPageOptions[0]);
  const [filters, setFilters] = useState<WorkLogsFilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<WorkLogsFilterState>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const query = useMemo<WorkLogsQuery>(
    () => ({
      page: currentPage,
      limit: itemPerPage,
      ...buildFilterQuery(appliedFilters),
    }),
    [appliedFilters, currentPage, itemPerPage],
  );

  useEffect(() => {
    const loadWorkLogs = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getWorkLogs(query);

        setWorkLogs(data);
        if (data.current_page && data.current_page !== currentPage) {
          setCurrentPage(data.current_page);
        }
      } catch (error) {
        setErrorMessage(getWorkLogsErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadWorkLogs();
  }, [currentPage, query]);

  const totalPages = workLogs.total_pages || 1;
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentPage(1);
    setAppliedFilters(filters);
  };

  const updateItemPerPage = (value: number) => {
    setItemPerPage(value);
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };
  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  return {
    currentPage,
    errorMessage,
    filters,
    goToNextPage,
    goToPreviousPage,
    handleSearch,
    isLoading,
    itemPerPage,
    setFilters,
    updateItemPerPage,
    totalPages,
    workLogs,
  };
};

export const WorkLogsPage = () => {
  const {
    currentPage,
    errorMessage,
    filters,
    goToNextPage,
    goToPreviousPage,
    handleSearch,
    isLoading,
    itemPerPage,
    setFilters,
    updateItemPerPage,
    totalPages,
    workLogs,
  } = useWorkLogs();
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">Work Logs</p>
        <h1 className="text-2xl font-semibold">Work Logs</h1>
        <p className="text-sm text-muted-foreground">
          Track daily work activity and service notes.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
          <h2 className="text-base font-semibold">All Work Logs</h2>
          <p className="text-sm text-muted-foreground">
            {workLogs.total_items} items
          </p>
        </div>

        <form
          className="grid gap-3 border-b px-4 py-4 lg:grid-cols-[minmax(220px,1fr)_120px_120px_auto] lg:items-end"
          onSubmit={handleSearch}
        >
          <div className="grid gap-2">
            <Label htmlFor="work-log-title">Title</Label>
            <Input
              id="work-log-title"
              onChange={(event) =>
                setFilters((value) => ({
                  ...value,
                  title: event.target.value,
                }))
              }
              placeholder="Search title"
              value={filters.title}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="work-log-month">Month</Label>
            <Select
              onValueChange={(month) =>
                setFilters((value) => ({
                  ...value,
                  month,
                }))
              }
              value={filters.month}
            >
              <SelectTrigger>
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
            <Label htmlFor="work-log-year">Year</Label>
            <Select
              onValueChange={(year) =>
                setFilters((value) => ({
                  ...value,
                  year,
                }))
              }
              value={filters.year}
            >
              <SelectTrigger>
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

          <Button
            className="w-full lg:w-auto"
            isLoading={isLoading}
            type="submit"
          >
            <SearchIcon aria-hidden="true" data-icon="inline-start" />
            Search
          </Button>
        </form>

        {isLoading ? (
          <div className="px-4 py-6 text-sm text-muted-foreground flex items-center justify-center">
            <LineMdLoadingLoop className="w-10 h-10" />
          </div>
        ) : errorMessage ? (
          <div className="px-4 py-6 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : workLogs.items.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="min-w-[220px]">Content</TableHead>
                <TableHead>Mood</TableHead>
                <TableHead>Productivity</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Logged Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workLogs.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.title}</TableCell>
                  <TableCell className="max-w-[280px] whitespace-normal text-muted-foreground">
                    {log.content}
                  </TableCell>
                  <TableCell>{log.mood_score}/5</TableCell>
                  <TableCell>{log.productivity_score}/5</TableCell>
                  <TableCell>
                    <div className="flex max-w-[240px] flex-wrap gap-1">
                      {log.tags.map((tag) => (
                        <span
                          className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                          key={`${tag.log_id}-${tag.work_tag}`}
                        >
                          {tag.work_tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatWorkLogDate(log.date_logged)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            No work logs yet.
          </div>
        )}

        <div className="grid gap-3 border-t px-4 py-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="hidden text-sm text-muted-foreground md:block">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              aria-label="Previous page"
              disabled={currentPage <= 1 || isLoading}
              onClick={goToPreviousPage}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <ChevronLeftIcon aria-hidden="true" />
            </Button>
            <span className="min-w-20 text-center text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              aria-label="Next page"
              disabled={currentPage >= totalPages || isLoading}
              onClick={goToNextPage}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          </div>

          <label className="flex items-center justify-center gap-2 text-sm text-muted-foreground md:justify-self-end">
            <span>Items per page</span>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              disabled={isLoading}
              onChange={(event) =>
                updateItemPerPage(Number(event.target.value))
              }
              value={itemPerPage}
            >
              {itemPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
};
