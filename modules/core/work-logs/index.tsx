"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
import { emptyWorkLogs, itemPerPageOptions, type WorkLogsData } from "./models";

const useWorkLogs = () => {
  const [workLogs, setWorkLogs] = useState<WorkLogsData>(emptyWorkLogs);
  const [currentPage, setCurrentPage] = useState(emptyWorkLogs.current_page);
  const [itemPerPage, setItemPerPage] = useState<number>(
    itemPerPageOptions[0]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadWorkLogs = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getWorkLogs();

        setWorkLogs(data);
        setCurrentPage(data.current_page || 1);
      } catch (error) {
        setErrorMessage(getWorkLogsErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadWorkLogs();
  }, []);

  const totalPages = workLogs.total_pages || 1;
  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };
  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  return {
    currentPage,
    errorMessage,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    itemPerPage,
    setItemPerPage,
    totalPages,
    workLogs,
  };
};

export const WorkLogsPage = () => {
  const {
    currentPage,
    errorMessage,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    itemPerPage,
    setItemPerPage,
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

        {isLoading ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            Loading work logs...
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
                <TableHead>Status</TableHead>
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
                  <TableCell>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {log.is_draft ? "Draft" : "Published"}
                    </span>
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
              disabled={currentPage <= 1}
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
              disabled={currentPage >= totalPages}
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
              onChange={(event) => setItemPerPage(Number(event.target.value))}
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
