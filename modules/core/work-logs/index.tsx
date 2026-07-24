"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PROPERTY_TYPES from "@/constants/properties";

import {
  deleteWorkLog,
  formatWorkLogDate,
  getMoodScoreLabel,
  getProductivityScoreLabel,
  getWorkLogs,
  getWorkLogsErrorMessage,
} from "./functions";
import {
  emptyWorkLogs,
  itemPerPageOptions,
  type WorkLogsData,
  type WorkLogsQuery,
  type WorkLog,
} from "./models";
import { WorkLogSheet } from "./WorkLogSheet";
import { appToast } from "@/lib/toast";
import { StatsGrid } from "./StatsGrid";
import { defaultActiveDaysTarget } from "./StatsGrid/models";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import PAGE_ROUTE from "@/constants/page_route";
import { LucideTimer } from "@/assets/icons/LucideTimer";
import { UilSearch } from "@/assets/icons/UilSearch";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilPen } from "@/assets/icons/UilPen";
import { UilEye } from "@/assets/icons/UilEye";
import { getPropertyOptionsByCode, type CachedPropertyOption } from "@/lib/properties";

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

const getPaginationItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);

  if (currentPage > 1) {
    pages.add(currentPage - 1);
  }

  if (currentPage < totalPages) {
    pages.add(currentPage + 1);
  }

  if (currentPage <= 4) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
    pages.add(5);
  }

  if (currentPage >= totalPages - 3) {
    pages.add(totalPages - 4);
    pages.add(totalPages - 3);
    pages.add(totalPages - 2);
    pages.add(totalPages - 1);
  }

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((firstPage, secondPage) => firstPage - secondPage)
    .flatMap((page, index, sortedPages) => {
      const previousPage = sortedPages[index - 1];

      if (previousPage && page - previousPage > 1) {
        return [`ellipsis-${previousPage}-${page}`, page];
      }

      return [page];
    });
};

const useWorkLogs = () => {
  const [workLogs, setWorkLogs] = useState<WorkLogsData>(emptyWorkLogs);
  const [currentPage, setCurrentPage] = useState(emptyWorkLogs.current_page);
  const [itemPerPage, setItemPerPage] = useState<number>(itemPerPageOptions[0]);
  const [filters, setFilters] = useState<WorkLogsFilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<WorkLogsFilterState>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const query = useMemo<WorkLogsQuery>(
    () => ({
      page: currentPage,
      limit: itemPerPage,
      ...buildFilterQuery(appliedFilters),
    }),
    [appliedFilters, currentPage, itemPerPage],
  );

  const reloadWorkLogs = () => {
    setReloadKey((value) => value + 1);
  };

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
  }, [currentPage, query, reloadKey]);

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

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
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
    goToPage,
    goToPreviousPage,
    handleSearch,
    isLoading,
    itemPerPage,
    reloadWorkLogs,
    setFilters,
    updateItemPerPage,
    totalPages,
    workLogs,
  };
};

type DeleteWorkLogDialogProps = {
  onDeleted: () => void;
  workLog: WorkLog;
};

const DeleteWorkLogDialog = ({
  onDeleted,
  workLog,
}: DeleteWorkLogDialogProps) => {
  return (
    <DeleteConfirmDialog
      ariaLabel="Delete work log"
      onConfirm={async () => {
        try {
          await deleteWorkLog(workLog.id);
          appToast.success("Work log deleted.");
          onDeleted();
        } catch (error) {
          appToast.error(getWorkLogsErrorMessage(error));
          throw error;
        }
      }}
      title="Delete work log"
    >
      Are you sure you want to delete {workLog.title}? <br />
      This action cannot be undone.
    </DeleteConfirmDialog>
  );
};

export const WorkLogsPage = () => {
  const [monthOpts, setMonthOpts] = useState<CachedPropertyOption[]>([]);
  const [yearOpts, setYearOpts] = useState<CachedPropertyOption[]>([]);
  const [moodOptions, setMoodOptions] = useState<CachedPropertyOption[]>([]);
  const [productivityOptions, setProductivityOptions] = useState<CachedPropertyOption[]>([]);

  useEffect(() => {
    void getPropertyOptionsByCode(PROPERTY_TYPES.WORK_TAGS);
    void getPropertyOptionsByCode(PROPERTY_TYPES.MONTH).then(setMonthOpts);
    void getPropertyOptionsByCode(PROPERTY_TYPES.YEAR).then(setYearOpts);
    void getPropertyOptionsByCode(PROPERTY_TYPES.MOOD_SCORE).then(setMoodOptions);
    void getPropertyOptionsByCode(PROPERTY_TYPES.PRODUCTIVITY_SCORE).then(setProductivityOptions);
  }, []);

  const {
    currentPage,
    errorMessage,
    filters,
    goToNextPage,
    goToPage,
    goToPreviousPage,
    handleSearch,
    isLoading,
    itemPerPage,
    reloadWorkLogs,
    setFilters,
    updateItemPerPage,
    totalPages,
    workLogs,
  } = useWorkLogs();
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const previousPageDisabled = currentPage <= 1 || isLoading;
  const nextPageDisabled = currentPage >= totalPages || isLoading;
  let workLogsContent: ReactNode;

  if (isLoading) {
    workLogsContent = (
      <div className="flex items-center justify-center px-4 py-6 text-sm text-muted-foreground h-[489.5px]">
        <LineMdLoadingLoop className="h-10 w-10" />
      </div>
    );
  } else if (errorMessage) {
    workLogsContent = (
      <div className="px-4 py-6 flex justify-center items-center text-sm text-destructive h-[489.5px]">
        {errorMessage}
      </div>
    );
  } else if (workLogs.items.length) {
    workLogsContent = (
      <Table classNameContainer="min-h-[489.5px] px-2">
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="text-center">Mood</TableHead>
            <TableHead className="text-center">Productivity</TableHead>
            <TableHead className="text-center">Tags</TableHead>
            <TableHead className="text-center">Logged Date</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workLogs.items.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">{log.title}</TableCell>
              <TableCell className="text-center">
                {getMoodScoreLabel(log.mood_score)}
              </TableCell>
              <TableCell className="text-center">
                {getProductivityScoreLabel(log.productivity_score)}
              </TableCell>
              <TableCell>
                <div className="flex justify-center max-w-60 flex-wrap gap-1">
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
              <TableCell className="text-center">
                {formatWorkLogDate(log.date_logged)}
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-2">
                  <WorkLogSheet
                    mode="view"
                    trigger={
                      <Button
                        aria-label="View work log"
                        size="icon-sm"
                        type="button"
                        variant="outline"
                      >
                        <UilEye aria-hidden="true" />
                      </Button>
                    }
                    workLog={log}
                  />
                  <WorkLogSheet
                    mode="edit"
                    onSaved={reloadWorkLogs}
                    trigger={
                      <Button
                        aria-label="Edit work log"
                        size="icon-sm"
                        type="button"
                        variant="warning"
                      >
                        <UilPen aria-hidden="true" />
                      </Button>
                    }
                    workLog={log}
                  />
                  <DeleteWorkLogDialog
                    onDeleted={reloadWorkLogs}
                    workLog={log}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  } else {
    workLogsContent = (
      <div className="px-4 py-6 text-sm text-muted-foreground min-h-[489.5px] flex items-center justify-center">
        No work logs yet.
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex gap-2 items-center">
            <LucideTimer className="w-10 h-10 text-primary" />
            <h1 className="text-2xl font-semibold">Work Logs</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Track daily work activity and service notes.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 -mb-1.5">
          <WorkLogSheet
            mode="create"
            onSaved={reloadWorkLogs}
            trigger={
              <Button type="button" variant="success" size="lg" className="w-fit font-medium">
                <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
                Add
              </Button>
            }
          />
          {/* <Link className="hover:text-primary hover:underline underline-offset-4" href={PAGE_ROUTE.WORK_LOGS.STATS}>
            view all stats {">"}
          </Link> */}
        </div>
      </div>

      <Separator />

      <StatsGrid
        activeDays={workLogs.total_items}
        allWorkLogs={workLogs.all_work_logs}
        monthlyMoodScore={workLogs.monthly_mood_score}
        monthlyProductivityScore={workLogs.monthly_productivity_score}
        activeDaysTarget={defaultActiveDaysTarget}
        moodOptions={moodOptions}
        productivityOptions={productivityOptions}
      />

      <div className="overflow-hidden rounded-lg border bg-card">
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
              <SelectTrigger className="h-9 min-h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  {monthOpts.map((month) => (
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
              <SelectTrigger className="h-9 min-h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  {yearOpts.map((year) => (
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
            variant="info"
            size="lg"
            type="submit"
          >
            <UilSearch aria-hidden="true" data-icon="inline-start" />
            Search
          </Button>
        </form>

        {workLogsContent}

        <div className="grid gap-3 border-t px-4 py-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="hidden text-sm text-muted-foreground md:block">
            Page {currentPage} of {totalPages}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={previousPageDisabled}
                  className={
                    previousPageDisabled ? "pointer-events-none opacity-50" : ""
                  }
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    goToPreviousPage();
                  }}
                  tabIndex={previousPageDisabled ? -1 : undefined}
                  text=""
                />
              </PaginationItem>

              {paginationItems.map((item) => (
                <PaginationItem key={item}>
                  {typeof item === "number" ? (
                    <PaginationLink
                      aria-disabled={isLoading}
                      className={
                        isLoading ? "pointer-events-none opacity-50" : ""
                      }
                      href="#"
                      isActive={item === currentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(item);
                      }}
                      tabIndex={isLoading ? -1 : undefined}
                    >
                      {item}
                    </PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  aria-disabled={nextPageDisabled}
                  className={
                    nextPageDisabled ? "pointer-events-none opacity-50" : ""
                  }
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    goToNextPage();
                  }}
                  tabIndex={nextPageDisabled ? -1 : undefined}
                  text=""
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

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
