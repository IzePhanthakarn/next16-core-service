"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { LucideWallet } from "@/assets/icons/LucideWallet";
import { UilEye } from "@/assets/icons/UilEye";
import { UilPen } from "@/assets/icons/UilPen";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilSearch } from "@/assets/icons/UilSearch";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

import {
  deleteTransaction,
  formatTransactionDate,
  getCategoryLabel,
  getTransactions,
  getTransactionsErrorMessage,
} from "./functions";
import {
  allFilterValue,
  emptyTransactions,
  itemPerPageOptions,
  type Transaction,
  type TransactionsData,
  type TransactionsQuery,
  type TransactionType,
} from "./models";
import { StatsGrid } from "./StatsGrid";
import { TransactionSheet } from "./TransactionSheet";

type TransactionsFilterState = {
  category: string;
  keyword: string;
  month: string;
  type: TransactionType | typeof allFilterValue;
  year: string;
};

const getDefaultFilters = (): TransactionsFilterState => {
  const today = new Date();

  return {
    category: allFilterValue,
    keyword: "",
    month: (today.getMonth() + 1).toString().padStart(2, "0"),
    type: allFilterValue,
    year: today.getFullYear().toString(),
  };
};

const defaultFilters = getDefaultFilters();

const buildFilterQuery = (filters: TransactionsFilterState) => ({
  ...(filters.keyword.trim() ? { keyword: filters.keyword.trim() } : {}),
  ...(filters.category === allFilterValue
    ? {}
    : { category: filters.category }),
  ...(filters.type === allFilterValue ? {} : { type: filters.type }),
  ...(filters.month.trim() ? { month: filters.month.trim() } : {}),
  ...(filters.year.trim() ? { year: filters.year.trim() } : {}),
});

// "all" shows both category sets merged; picking a type narrows it to that set.
const getCategoryOptions = (
  type: TransactionsFilterState["type"],
  expenseOpts: CachedPropertyOption[],
  incomeOpts: CachedPropertyOption[],
) => {
  if (type === "expense") {
    return expenseOpts;
  }

  if (type === "income") {
    return incomeOpts;
  }

  const merged = new Map<string, CachedPropertyOption>();

  for (const option of [...expenseOpts, ...incomeOpts]) {
    merged.set(option.value, option);
  }

  return [...merged.values()];
};

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

const useTransactions = () => {
  const [transactions, setTransactions] =
    useState<TransactionsData>(emptyTransactions);
  const [currentPage, setCurrentPage] = useState(emptyTransactions.current_page);
  const [itemPerPage, setItemPerPage] = useState<number>(itemPerPageOptions[0]);
  const [filters, setFilters] =
    useState<TransactionsFilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<TransactionsFilterState>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const query = useMemo<TransactionsQuery>(
    () => ({
      page: currentPage,
      limit: itemPerPage,
      ...buildFilterQuery(appliedFilters),
    }),
    [appliedFilters, currentPage, itemPerPage],
  );

  const reloadTransactions = () => {
    setReloadKey((value) => value + 1);
  };

  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getTransactions(query);

        setTransactions(data);
        if (data.current_page && data.current_page !== currentPage) {
          setCurrentPage(data.current_page);
        }
      } catch (error) {
        setErrorMessage(getTransactionsErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadTransactions();
  }, [currentPage, query, reloadKey]);

  const totalPages = transactions.total_pages || 1;

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
    reloadTransactions,
    setFilters,
    totalPages,
    transactions,
    updateItemPerPage,
  };
};

type DeleteTransactionDialogProps = {
  onDeleted: () => void;
  transaction: Transaction;
};

const DeleteTransactionDialog = ({
  onDeleted,
  transaction,
}: DeleteTransactionDialogProps) => {
  return (
    <DeleteConfirmDialog
      ariaLabel="Delete transaction"
      onConfirm={async () => {
        try {
          await deleteTransaction(transaction.id);
          appToast.success("Transaction deleted.");
          onDeleted();
        } catch (error) {
          appToast.error(getTransactionsErrorMessage(error));
          throw error;
        }
      }}
      title="Delete transaction"
    >
      Are you sure you want to delete {transaction.title}? <br />
      This action cannot be undone.
    </DeleteConfirmDialog>
  );
};

export const TransactionsPage = () => {
  const [monthOpts, setMonthOpts] = useState<CachedPropertyOption[]>([]);
  const [yearOpts, setYearOpts] = useState<CachedPropertyOption[]>([]);
  const [typeOpts, setTypeOpts] = useState<CachedPropertyOption[]>([]);
  const [expenseCategoryOpts, setExpenseCategoryOpts] = useState<
    CachedPropertyOption[]
  >([]);
  const [incomeCategoryOpts, setIncomeCategoryOpts] = useState<
    CachedPropertyOption[]
  >([]);

  useEffect(() => {
    void getPropertyOptionsByCode(PROPERTY_TYPES.MONTH).then(setMonthOpts);
    void getPropertyOptionsByCode(PROPERTY_TYPES.YEAR).then(setYearOpts);
    void getPropertyOptionsByCode(PROPERTY_TYPES.TRANSACTION_TYPE).then(
      setTypeOpts,
    );
    void getPropertyOptionsByCode(
      PROPERTY_TYPES.TRANSACTION_EXPENSE_CATEGORY,
    ).then(setExpenseCategoryOpts);
    void getPropertyOptionsByCode(
      PROPERTY_TYPES.TRANSACTION_INCOME_CATEGORY,
    ).then(setIncomeCategoryOpts);
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
    reloadTransactions,
    setFilters,
    totalPages,
    transactions,
    updateItemPerPage,
  } = useTransactions();
  const categoryOpts = getCategoryOptions(
    filters.type,
    expenseCategoryOpts,
    incomeCategoryOpts,
  );
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const previousPageDisabled = currentPage <= 1 || isLoading;
  const nextPageDisabled = currentPage >= totalPages || isLoading;
  let transactionsContent: ReactNode;

  if (isLoading) {
    transactionsContent = (
      <div className="flex items-center justify-center px-4 py-6 text-sm text-muted-foreground h-[489.5px]">
        <LineMdLoadingLoop className="h-10 w-10" />
      </div>
    );
  } else if (errorMessage) {
    transactionsContent = (
      <div className="px-4 py-6 flex justify-center items-center text-sm text-destructive h-[489.5px]">
        {errorMessage}
      </div>
    );
  } else if (transactions.items.length) {
    transactionsContent = (
      <Table classNameContainer="min-h-[489.5px] px-2">
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center">Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Transaction Date</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.items.map((transaction) => {
            const isIncome = transaction.type === "income";

            return (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {transaction.title}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={cn(
                      "capitalize",
                      isIncome
                        ? "bg-green-600/10 text-green-700 dark:text-green-400"
                        : "bg-red-600/10 text-red-700 dark:text-red-400",
                    )}
                  >
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {getCategoryLabel(transaction.type, transaction.category)}
                  </span>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    isIncome
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400",
                  )}
                >
                  {isIncome ? "+" : "-"}
                  {formatAmount(transaction.amount)}
                </TableCell>
                <TableCell className="text-center">
                  {formatTransactionDate(transaction.transaction_date)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <TransactionSheet
                      mode="view"
                      onSaved={reloadTransactions}
                      transaction={transaction}
                      trigger={
                        <Button
                          aria-label="View transaction"
                          size="icon-sm"
                          type="button"
                          variant="outline"
                        >
                          <UilEye aria-hidden="true" />
                        </Button>
                      }
                    />
                    <TransactionSheet
                      mode="edit"
                      onSaved={reloadTransactions}
                      transaction={transaction}
                      trigger={
                        <Button
                          aria-label="Edit transaction"
                          size="icon-sm"
                          type="button"
                          variant="warning"
                        >
                          <UilPen aria-hidden="true" />
                        </Button>
                      }
                    />
                    <DeleteTransactionDialog
                      onDeleted={reloadTransactions}
                      transaction={transaction}
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
    transactionsContent = (
      <div className="px-4 py-6 text-sm text-muted-foreground min-h-[489.5px] flex items-center justify-center">
        No transactions yet.
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex gap-2 items-center">
            <LucideWallet className="w-10 h-10 text-primary" />
            <h1 className="text-2xl font-semibold">Transactions</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your income and expenses.
          </p>
        </div>
        <TransactionSheet
          mode="create"
          onSaved={reloadTransactions}
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

      <StatsGrid stats={transactions.stats} />

      <div className="overflow-hidden rounded-lg border bg-card">
        <form
          className="grid gap-3 border-b px-4 py-4 lg:grid-cols-[minmax(200px,1fr)_130px_minmax(140px,1fr)_120px_120px_auto] lg:items-end"
          onSubmit={handleSearch}
        >
          <div className="grid gap-2">
            <Label htmlFor="transaction-keyword">Title</Label>
            <Input
              id="transaction-keyword"
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
            <Label htmlFor="transaction-type">Type</Label>
            <Select
              onValueChange={(type) =>
                setFilters((value) => ({
                  ...value,
                  category: allFilterValue,
                  type: type as TransactionsFilterState["type"],
                }))
              }
              value={filters.type}
            >
              <SelectTrigger className="h-9 min-h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value={allFilterValue}>All</SelectItem>
                  {typeOpts.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transaction-category">Category</Label>
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
                id="transaction-category"
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
            <Label htmlFor="transaction-month">Month</Label>
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
            <Label htmlFor="transaction-year">Year</Label>
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

        {transactionsContent}

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
