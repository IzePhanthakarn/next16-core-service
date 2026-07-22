"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { UilCarSideview } from "@/assets/icons/UilCarSideview";
import { UilEye } from "@/assets/icons/UilEye";
import { UilPen } from "@/assets/icons/UilPen";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilSearch } from "@/assets/icons/UilSearch";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PROPERTY_TYPES from "@/constants/properties";
import { formatAmount } from "@/lib/currency";
import { getPropertyOptionsByCode, type CachedPropertyOption } from "@/lib/properties";
import { appToast } from "@/lib/toast";

import {
  deleteTransportationExpense,
  formatTransportationExpenseDate,
  getTransportationExpenseCategoryLabel,
  getTransportationExpenses,
  getTransportationExpensesErrorMessage,
} from "./functions";
import {
  allFilterValue,
  emptyTransportationExpenses,
  itemPerPageOptions,
  type TransportationExpense,
  type TransportationExpensesData,
  type TransportationExpensesQuery,
} from "./models";
import { StatsGrid } from "./StatsGrid";
import { TransportationExpenseSheet } from "./TransportationExpenseSheet";

type TransportationExpensesFilterState = {
  category: string;
  keyword: string;
  month: string;
  year: string;
};

const getDefaultFilters = (): TransportationExpensesFilterState => {
  const today = new Date();

  return {
    category: allFilterValue,
    keyword: "",
    month: (today.getMonth() + 1).toString().padStart(2, "0"),
    year: today.getFullYear().toString(),
  };
};

const defaultFilters = getDefaultFilters();

const buildFilterQuery = (filters: TransportationExpensesFilterState) => ({
  ...(filters.keyword.trim() ? { keyword: filters.keyword.trim() } : {}),
  ...(filters.category === allFilterValue
    ? {}
    : { category: filters.category }),
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

const useTransportationExpenses = () => {
  const [transportationExpenses, setTransportationExpenses] =
    useState<TransportationExpensesData>(emptyTransportationExpenses);
  const [currentPage, setCurrentPage] = useState(emptyTransportationExpenses.current_page);
  const [itemPerPage, setItemPerPage] = useState<number>(itemPerPageOptions[0]);
  const [filters, setFilters] =
    useState<TransportationExpensesFilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<TransportationExpensesFilterState>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const query = useMemo<TransportationExpensesQuery>(
    () => ({
      page: currentPage,
      limit: itemPerPage,
      ...buildFilterQuery(appliedFilters),
    }),
    [appliedFilters, currentPage, itemPerPage],
  );

  const reloadTransportationExpenses = () => {
    setReloadKey((value) => value + 1);
  };

  useEffect(() => {
    const loadTransportationExpenses = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getTransportationExpenses(query);

        setTransportationExpenses(data);
        if (data.current_page && data.current_page !== currentPage) {
          setCurrentPage(data.current_page);
        }
      } catch (error) {
        setErrorMessage(getTransportationExpensesErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadTransportationExpenses();
  }, [currentPage, query, reloadKey]);

  const totalPages = transportationExpenses.total_pages || 1;

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
    reloadTransportationExpenses,
    setFilters,
    totalPages,
    transportationExpenses,
    updateItemPerPage,
  };
};

type DeleteTransportationExpenseDialogProps = {
  onDeleted: () => void;
  transportationExpense: TransportationExpense;
};

const DeleteTransportationExpenseDialog = ({
  onDeleted,
  transportationExpense,
}: DeleteTransportationExpenseDialogProps) => {
  return (
    <DeleteConfirmDialog
      ariaLabel="Delete transportation expense"
      onConfirm={async () => {
        try {
          await deleteTransportationExpense(transportationExpense.id);
          appToast.success("Transportation expense deleted.");
          onDeleted();
        } catch (error) {
          appToast.error(getTransportationExpensesErrorMessage(error));
          throw error;
        }
      }}
      title="Delete transportation expense"
    >
      Are you sure you want to delete {transportationExpense.title}? <br />
      This action cannot be undone.
    </DeleteConfirmDialog>
  );
};

export const TransportationExpensesPage = () => {
  const [monthOpts, setMonthOpts] = useState<CachedPropertyOption[]>([]);
  const [yearOpts, setYearOpts] = useState<CachedPropertyOption[]>([]);
  const [categoryOpts, setCategoryOpts] = useState<
    CachedPropertyOption[]
  >([]);

  useEffect(() => {
    void getPropertyOptionsByCode(PROPERTY_TYPES.MONTH).then(setMonthOpts);
    void getPropertyOptionsByCode(PROPERTY_TYPES.YEAR).then(setYearOpts);
    void getPropertyOptionsByCode(PROPERTY_TYPES.TRAVEL_EXPENSES).then(
      setCategoryOpts,
    );
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
    reloadTransportationExpenses,
    setFilters,
    totalPages,
    transportationExpenses,
    updateItemPerPage,
  } = useTransportationExpenses();
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const previousPageDisabled = currentPage <= 1 || isLoading;
  const nextPageDisabled = currentPage >= totalPages || isLoading;
  let transportationExpensesContent: ReactNode;

  if (isLoading) {
    transportationExpensesContent = (
      <div className="flex items-center justify-center px-4 py-6 text-sm text-muted-foreground h-[489.5px]">
        <LineMdLoadingLoop className="h-10 w-10" />
      </div>
    );
  } else if (errorMessage) {
    transportationExpensesContent = (
      <div className="px-4 py-6 flex justify-center items-center text-sm text-destructive h-[489.5px]">
        {errorMessage}
      </div>
    );
  } else if (transportationExpenses.items.length) {
    transportationExpensesContent = (
      <Table classNameContainer="min-h-[489.5px] px-2">
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="text-center">Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Expense Date</TableHead>
            <TableHead className="text-center">Synced</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transportationExpenses.items.map((transportationExpense) => {
            return (
              <TableRow key={transportationExpense.id}>
                <TableCell className="font-medium">
                  {transportationExpense.title}
                </TableCell>
                <TableCell className="text-center">
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {getTransportationExpenseCategoryLabel(
                      transportationExpense.category,
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums text-red-700 dark:text-red-400">
                  -{formatAmount(transportationExpense.amount)}
                </TableCell>
                <TableCell className="text-center">
                  {formatTransportationExpenseDate(
                    transportationExpense.expense_date,
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {transportationExpense.transaction_id ? "Yes" : "No"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <TransportationExpenseSheet
                      mode="view"
                      onSaved={reloadTransportationExpenses}
                      transportationExpense={transportationExpense}
                      trigger={
                        <Button
                          aria-label="View transportation expense"
                          size="icon-sm"
                          type="button"
                          variant="outline"
                        >
                          <UilEye aria-hidden="true" />
                        </Button>
                      }
                    />
                    <TransportationExpenseSheet
                      mode="edit"
                      onSaved={reloadTransportationExpenses}
                      transportationExpense={transportationExpense}
                      trigger={
                        <Button
                          aria-label="Edit transportation expense"
                          size="icon-sm"
                          type="button"
                          variant="warning"
                        >
                          <UilPen aria-hidden="true" />
                        </Button>
                      }
                    />
                    <DeleteTransportationExpenseDialog
                      onDeleted={reloadTransportationExpenses}
                      transportationExpense={transportationExpense}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  } else {
    transportationExpensesContent = (
      <div className="px-4 py-6 text-sm text-muted-foreground min-h-[489.5px] flex items-center justify-center">
        No transportation expenses yet.
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex gap-2 items-center">
            <UilCarSideview className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-semibold">Transportation Expenses</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your travel and transportation costs.
          </p>
        </div>
        <TransportationExpenseSheet
          mode="create"
          onSaved={reloadTransportationExpenses}
          trigger={
            <Button
              type="button"
              variant="success"
              size="lg"
              className="w-fit font-medium"
            >
              <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
              Add
            </Button>
          }
        />
      </div>

      <Separator />

      <StatsGrid stats={transportationExpenses.stats} />

      <div className="overflow-hidden rounded-lg border bg-card">
        <form
          className="grid gap-3 border-b px-4 py-4 lg:grid-cols-[minmax(200px,1fr)_minmax(160px,1fr)_120px_120px_auto] lg:items-end"
          onSubmit={handleSearch}
        >
          <div className="grid gap-2">
            <Label htmlFor="transportation-expense-keyword">Title</Label>
            <Input
              id="transportation-expense-keyword"
              onChange={(event) =>
                setFilters((value) => ({
                  ...value,
                  keyword: event.target.value,
                }))
              }
              placeholder="Search title"
              value={filters.keyword}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transportation-expense-category">Category</Label>
            <Select
              onValueChange={(category) =>
                setFilters((value) => ({
                  ...value,
                  category,
                }))
              }
              value={filters.category}
            >
              <SelectTrigger
                className="h-9 min-h-9 w-full"
                id="transportation-expense-category"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value={allFilterValue}>All</SelectItem>
                  {categoryOpts.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transportation-expense-month">Month</Label>
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
            <Label htmlFor="transportation-expense-year">Year</Label>
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

        {transportationExpensesContent}

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
