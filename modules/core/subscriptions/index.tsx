"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { LucideRepeat } from "@/assets/icons/LucideRepeat";
import { UilEye } from "@/assets/icons/UilEye";
import { UilPen } from "@/assets/icons/UilPen";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilSearch } from "@/assets/icons/UilSearch";
import { UilSync } from "@/assets/icons/UilSync";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { ToggleStatusConfirmDialog } from "@/components/dialogs/toggle-status-confirm-dialog";
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
import {
  getPropertyOptionsByCode,
  type CachedPropertyOption,
} from "@/lib/properties";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  deleteSubscription,
  formatNextBillingDate,
  getCategoryLabel,
  getSubscriptions,
  getSubscriptionsErrorMessage,
  toggleSubscription,
} from "./functions";
import {
  allFilterValue,
  itemPerPageOptions,
  type BillingCycle,
  type Subscription,
  type SubscriptionsQuery,
} from "./models";
import { SubscriptionSheet } from "./SubscriptionSheet";

type SubscriptionsFilterState = {
  billingCycle: BillingCycle | typeof allFilterValue;
  isActive: string;
  keyword: string;
};

const defaultFilters: SubscriptionsFilterState = {
  billingCycle: allFilterValue,
  isActive: allFilterValue,
  keyword: "",
};

const buildFilterQuery = (filters: SubscriptionsFilterState) => ({
  ...(filters.keyword.trim() ? { keyword: filters.keyword.trim() } : {}),
  ...(filters.billingCycle === allFilterValue
    ? {}
    : { billing_cycle: filters.billingCycle }),
  ...(filters.isActive === allFilterValue
    ? {}
    : { is_active: filters.isActive === "true" }),
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

const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState<number>(itemPerPageOptions[0]);
  const [filters, setFilters] =
    useState<SubscriptionsFilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<SubscriptionsFilterState>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const query = useMemo<SubscriptionsQuery>(
    () => buildFilterQuery(appliedFilters),
    [appliedFilters],
  );

  const reloadSubscriptions = () => {
    setReloadKey((value) => value + 1);
  };

  useEffect(() => {
    const loadSubscriptions = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getSubscriptions(query);

        setSubscriptions(data);
      } catch (error) {
        setErrorMessage(getSubscriptionsErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadSubscriptions();
  }, [query, reloadKey]);

  // The endpoint has no page/limit params and returns every match at once, so
  // the paging is done here.
  const totalPages = Math.max(Math.ceil(subscriptions.length / itemPerPage), 1);
  const safePage = Math.min(currentPage, totalPages);
  const pagedSubscriptions = subscriptions.slice(
    (safePage - 1) * itemPerPage,
    safePage * itemPerPage,
  );

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
    currentPage: safePage,
    errorMessage,
    filters,
    goToNextPage,
    goToPage,
    goToPreviousPage,
    handleSearch,
    isLoading,
    itemPerPage,
    reloadSubscriptions,
    setFilters,
    subscriptions: pagedSubscriptions,
    totalPages,
    updateItemPerPage,
  };
};

type SubscriptionRowActionProps = {
  onDone: () => void;
  subscription: Subscription;
};

const ToggleSubscriptionDialog = ({
  onDone,
  subscription,
}: SubscriptionRowActionProps) => {
  return (
    <ToggleStatusConfirmDialog
      ariaLabel="Toggle subscription status"
      isActive={subscription.is_active}
      onConfirm={async () => {
        try {
          await toggleSubscription(subscription.id);
          appToast.success(
            subscription.is_active
              ? "Subscription deactivated."
              : "Subscription activated.",
          );
          onDone();
        } catch (error) {
          appToast.error(getSubscriptionsErrorMessage(error));
          throw error;
        }
      }}
      title={
        subscription.is_active
          ? "Deactivate subscription"
          : "Activate subscription"
      }
      trigger={
        <Button
          aria-label="Toggle subscription status"
          size="icon-sm"
          type="button"
          variant="secondary"
        >
          <UilSync aria-hidden="true" />
        </Button>
      }
    >
      {subscription.is_active ? (
        <>
          Stop counting {subscription.name} as an active cost? <br />
          The record is kept and you can turn it back on later.
        </>
      ) : (
        <>
          Start counting {subscription.name} as an active cost again?
        </>
      )}
    </ToggleStatusConfirmDialog>
  );
};

const DeleteSubscriptionDialog = ({
  onDone,
  subscription,
}: SubscriptionRowActionProps) => {
  return (
    <DeleteConfirmDialog
      ariaLabel="Delete subscription"
      onConfirm={async () => {
        try {
          await deleteSubscription(subscription.id);
          appToast.success("Subscription deleted.");
          onDone();
        } catch (error) {
          appToast.error(getSubscriptionsErrorMessage(error));
          throw error;
        }
      }}
      title="Delete subscription"
    >
      Are you sure you want to delete {subscription.name}? <br />
      This action cannot be undone.
    </DeleteConfirmDialog>
  );
};

export const SubscriptionsPage = () => {
  const [billingCycleOpts, setBillingCycleOpts] = useState<
    CachedPropertyOption[]
  >([]);
  const [statusOpts, setStatusOpts] = useState<CachedPropertyOption[]>([]);

  useEffect(() => {
    void getPropertyOptionsByCode(PROPERTY_TYPES.BILLING_CYCLE).then(
      setBillingCycleOpts,
    );
    void getPropertyOptionsByCode(PROPERTY_TYPES.STATUS).then(setStatusOpts);
    void getPropertyOptionsByCode(PROPERTY_TYPES.MONTH);
    void getPropertyOptionsByCode(PROPERTY_TYPES.TRANSACTION_EXPENSE_CATEGORY);
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
    reloadSubscriptions,
    setFilters,
    subscriptions,
    totalPages,
    updateItemPerPage,
  } = useSubscriptions();
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const previousPageDisabled = currentPage <= 1 || isLoading;
  const nextPageDisabled = currentPage >= totalPages || isLoading;
  let subscriptionsContent: ReactNode;

  if (isLoading) {
    subscriptionsContent = (
      <div className="flex items-center justify-center px-4 py-6 text-sm text-muted-foreground h-[489.5px]">
        <LineMdLoadingLoop className="h-10 w-10" />
      </div>
    );
  } else if (errorMessage) {
    subscriptionsContent = (
      <div className="px-4 py-6 flex justify-center items-center text-sm text-destructive h-[489.5px]">
        {errorMessage}
      </div>
    );
  } else if (subscriptions.length) {
    subscriptionsContent = (
      <Table classNameContainer="min-h-[489.5px] px-2">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-center">Cycle</TableHead>
            <TableHead className="text-center">Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Next Billing</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">
                {subscription.name}
              </TableCell>
              <TableCell className="text-center">
                <Badge className="capitalize" variant="secondary">
                  {subscription.billing_cycle}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  {getCategoryLabel(subscription.category)}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatAmount(subscription.amount)}
              </TableCell>
              <TableCell className="text-center">
                {formatNextBillingDate(subscription)}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  className={cn(
                    subscription.is_active
                      ? "bg-green-600/10 text-green-700 dark:text-green-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {subscription.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-2">
                  <SubscriptionSheet
                    mode="view"
                    onSaved={reloadSubscriptions}
                    subscription={subscription}
                    trigger={
                      <Button
                        aria-label="View subscription"
                        size="icon-sm"
                        type="button"
                        variant="outline"
                      >
                        <UilEye aria-hidden="true" />
                      </Button>
                    }
                  />
                  <SubscriptionSheet
                    mode="edit"
                    onSaved={reloadSubscriptions}
                    subscription={subscription}
                    trigger={
                      <Button
                        aria-label="Edit subscription"
                        size="icon-sm"
                        type="button"
                        variant="warning"
                      >
                        <UilPen aria-hidden="true" />
                      </Button>
                    }
                  />
                  <ToggleSubscriptionDialog
                    onDone={reloadSubscriptions}
                    subscription={subscription}
                  />
                  <DeleteSubscriptionDialog
                    onDone={reloadSubscriptions}
                    subscription={subscription}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  } else {
    subscriptionsContent = (
      <div className="px-4 py-6 text-sm text-muted-foreground min-h-[489.5px] flex items-center justify-center">
        No subscriptions yet.
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex gap-2 items-center">
            <LucideRepeat className="w-10 h-10 text-primary" />
            <h1 className="text-2xl font-semibold">Subscriptions</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Track recurring costs and when they are charged.
          </p>
        </div>
        <SubscriptionSheet
          mode="create"
          onSaved={reloadSubscriptions}
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

      <div className="overflow-hidden rounded-lg border bg-card">
        <form
          className="grid gap-3 border-b px-4 py-4 lg:grid-cols-[minmax(220px,1fr)_150px_150px_auto] lg:items-end"
          onSubmit={handleSearch}
        >
          <div className="grid gap-2">
            <Label htmlFor="subscription-keyword">Name</Label>
            <Input
              id="subscription-keyword"
              onChange={(event) =>
                setFilters((value) => ({
                  ...value,
                  keyword: event.target.value,
                }))
              }
              placeholder="Search name"
              value={filters.keyword}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subscription-cycle">Billing cycle</Label>
            <Select
              onValueChange={(billingCycle) =>
                setFilters((value) => ({
                  ...value,
                  billingCycle:
                    billingCycle as SubscriptionsFilterState["billingCycle"],
                }))
              }
              value={filters.billingCycle}
            >
              <SelectTrigger
                className="h-9 min-h-9 w-full"
                id="subscription-cycle"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value={allFilterValue}>All</SelectItem>
                  {billingCycleOpts.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subscription-status">Status</Label>
            <Select
              onValueChange={(isActive) =>
                setFilters((value) => ({
                  ...value,
                  isActive,
                }))
              }
              value={filters.isActive}
            >
              <SelectTrigger
                className="h-9 min-h-9 w-full"
                id="subscription-status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value={allFilterValue}>All</SelectItem>
                  {statusOpts.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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

        {subscriptionsContent}

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
