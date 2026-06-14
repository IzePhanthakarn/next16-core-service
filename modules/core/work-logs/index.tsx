"use client";

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import {
  createWorkLog,
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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { monthOptions, yearOption } from "@/constants/datetime";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
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

type AddWorkLogFormState = {
  content: string;
  dateLogged?: Date;
  moodScore: string;
  productivityScore: string;
  tags: string;
  title: string;
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

const getDefaultAddWorkLogForm = (): AddWorkLogFormState => ({
  content: "",
  dateLogged: new Date(),
  moodScore: "1",
  productivityScore: "1",
  tags: "",
  title: "",
});

const buildFilterQuery = (filters: WorkLogsFilterState) => ({
  ...(filters.title.trim() ? { title: filters.title.trim() } : {}),
  ...(filters.month.trim() ? { month: filters.month.trim() } : {}),
  ...(filters.year.trim() ? { year: filters.year.trim() } : {}),
});

const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
  const timezoneOffset = -date.getTimezoneOffset();
  const timezoneSign = timezoneOffset >= 0 ? "+" : "-";
  const timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60)
    .toString()
    .padStart(2, "0");
  const timezoneMinutes = (Math.abs(timezoneOffset) % 60)
    .toString()
    .padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} ${timezoneSign}${timezoneHours}${timezoneMinutes}`;
};

const formatDatePickerLabel = (date?: Date) =>
  date
    ? new Intl.DateTimeFormat("en-EN", {
        dateStyle: "medium",
      }).format(date)
    : "Select date";

const getTagsFromText = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

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
    reloadWorkLogs,
    setFilters,
    updateItemPerPage,
    totalPages,
    workLogs,
  };
};

type DateLoggedPickerProps = {
  date?: Date;
  onSelect: (date?: Date) => void;
};

const DateLoggedPicker = ({ date, onSelect }: DateLoggedPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          type="button"
          variant="outline"
        >
          <CalendarIcon aria-hidden="true" data-icon="inline-start" />
          {formatDatePickerLabel(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onSelect(selectedDate);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

type AddWorkLogSheetProps = {
  onCreated: () => void;
};

const AddWorkLogSheet = ({ onCreated }: AddWorkLogSheetProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AddWorkLogFormState>(
    getDefaultAddWorkLogForm
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setForm(getDefaultAddWorkLogForm());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim() || !form.dateLogged) {
      appToast.error("Please fill title, content, and date logged.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createWorkLog({
        content: form.content.trim(),
        date_logged: formatDateForApi(form.dateLogged),
        mood_score: Number(form.moodScore),
        productivity_score: Number(form.productivityScore),
        tags: getTagsFromText(form.tags),
        title: form.title.trim(),
      });

      appToast.success("Work log added.");
      resetForm();
      setOpen(false);
      onCreated();
    } catch (error) {
      appToast.error(getWorkLogsErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="success">
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
          Add
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>Add work logs</SheetTitle>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="grid flex-1 gap-4 overflow-y-auto px-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="add-work-log-title">Title</Label>
              <Input
                id="add-work-log-title"
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    title: event.target.value,
                  }))
                }
                placeholder="Work log title"
                value={form.title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-work-log-content">Content</Label>
              <Textarea
                className="min-h-32 resize-none"
                id="add-work-log-content"
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    content: event.target.value,
                  }))
                }
                placeholder="What did you work on?"
                value={form.content}
              />
            </div>

            <div className="grid gap-2">
              <Label>Date logged</Label>
              <DateLoggedPicker
                date={form.dateLogged}
                onSelect={(dateLogged) =>
                  setForm((value) => ({
                    ...value,
                    dateLogged,
                  }))
                }
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="add-work-log-mood">Mood score</Label>
                <Input
                  id="add-work-log-mood"
                  max={5}
                  min={1}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      moodScore: event.target.value,
                    }))
                  }
                  type="number"
                  value={form.moodScore}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="add-work-log-productivity">
                  Productivity score
                </Label>
                <Input
                  id="add-work-log-productivity"
                  max={5}
                  min={1}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      productivityScore: event.target.value,
                    }))
                  }
                  type="number"
                  value={form.productivityScore}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-work-log-tags">Tags</Label>
              <Input
                id="add-work-log-tags"
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    tags: event.target.value,
                  }))
                }
                placeholder="frontend, api, planning"
                value={form.tags}
              />
            </div>
          </div>

          <SheetFooter className="border-t sm:flex-row sm:justify-end">
            <Button
              disabled={isSubmitting}
              onClick={resetForm}
              type="button"
              variant="outline"
            >
              <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
              Reset form
            </Button>
            <Button isLoading={isSubmitting} type="submit" variant="success">
              <PlusIcon aria-hidden="true" data-icon="inline-start" />
              Add work log
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
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
    reloadWorkLogs,
    setFilters,
    updateItemPerPage,
    totalPages,
    workLogs,
  } = useWorkLogs();
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">Work Logs</p>
          <h1 className="text-2xl font-semibold">Work Logs</h1>
          <p className="text-sm text-muted-foreground">
            Track daily work activity and service notes.
          </p>
        </div>
        <AddWorkLogSheet onCreated={reloadWorkLogs} />
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
