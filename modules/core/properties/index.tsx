"use client";

import Link from "next/link";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PAGE_ROUTE from "@/constants/page_route";
import { appToast } from "@/lib/toast";

import {
  deleteProperty,
  formatPropertyDate,
  getProperties,
  getPropertiesErrorMessage,
} from "./functions";
import {
  emptyProperties,
  itemPerPageOptions,
  type PropertiesData,
  type PropertiesQuery,
} from "./models";
import { PropertySheet } from "./PropertySheet";
import { LucideTags } from "@/assets/icons/LucideTags";
import { UilSearch } from "@/assets/icons/UilSearch";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilPen } from "@/assets/icons/UilPen";

type PropertiesFilterState = {
  name: string;
  code: string;
};

const defaultFilters: PropertiesFilterState = {
  name: "",
  code: "",
};

const buildFilterQuery = (filters: PropertiesFilterState) => ({
  ...(filters.name.trim() ? { name: filters.name.trim() } : {}),
  ...(filters.code.trim() ? { code: filters.code.trim() } : {}),
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

const useProperties = () => {
  const [properties, setProperties] =
    useState<PropertiesData>(emptyProperties);
  const [currentPage, setCurrentPage] = useState(
    emptyProperties.current_page,
  );
  const [itemPerPage, setItemPerPage] = useState<number>(
    itemPerPageOptions[0],
  );
  const [filters, setFilters] =
    useState<PropertiesFilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<PropertiesFilterState>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const query = useMemo<PropertiesQuery>(
    () => ({
      page: currentPage,
      limit: itemPerPage,
      ...buildFilterQuery(appliedFilters),
    }),
    [appliedFilters, currentPage, itemPerPage],
  );

  const reloadProperties = () => {
    setReloadKey((value) => value + 1);
  };

  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getProperties(query);

        setProperties(data);
        if (data.current_page && data.current_page !== currentPage) {
          setCurrentPage(data.current_page);
        }
      } catch (error) {
        setErrorMessage(getPropertiesErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadProperties();
  }, [currentPage, query, reloadKey]);

  const totalPages = properties.total_pages || 1;

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
    properties,
    reloadProperties,
    setFilters,
    totalPages,
    updateItemPerPage,
  };
};

export const PropertiesPage = () => {
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
    properties,
    reloadProperties,
    setFilters,
    totalPages,
    updateItemPerPage,
  } = useProperties();
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const previousPageDisabled = currentPage <= 1 || isLoading;
  const nextPageDisabled = currentPage >= totalPages || isLoading;
  let propertiesContent: ReactNode;

  if (isLoading) {
    propertiesContent = (
      <div className="flex h-[489.5px] items-center justify-center px-4 py-6 text-sm text-muted-foreground">
        <LineMdLoadingLoop className="h-10 w-10" />
      </div>
    );
  } else if (errorMessage) {
    propertiesContent = (
      <div className="flex h-[489.5px] items-center justify-center px-4 py-6 text-sm text-destructive">
        {errorMessage}
      </div>
    );
  } else if (properties.items.length) {
    propertiesContent = (
      <Table classNameContainer="min-h-[489.5px] px-2">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center">Created Date</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.items.map((property) => (
            <TableRow key={property.id}>
              <TableCell className="font-medium">{property.name}</TableCell>
              <TableCell>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {property.code}
                </span>
              </TableCell>
              <TableCell className="max-w-[420px] whitespace-normal text-muted-foreground">
                {property.description || "-"}
              </TableCell>
              <TableCell className="text-center">
                {formatPropertyDate(property.created_at)}
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-2">
                  <Button
                    aria-label="Edit property"
                    asChild
                    size="icon-sm"
                    variant="warning"
                  >
                    <Link href={PAGE_ROUTE.PROPERTIES.DETAIL(property.id)}>
                      <UilPen aria-hidden="true" />
                    </Link>
                  </Button>
                  <DeleteConfirmDialog
                    ariaLabel="Delete property"
                    onConfirm={async () => {
                      try {
                        await deleteProperty(property.id);
                        appToast.success("Property deleted.");
                        reloadProperties();
                      } catch (error) {
                        appToast.error(getPropertiesErrorMessage(error));
                        throw error;
                      }
                    }}
                    title="Delete property"
                  >
                    Are you sure you want to delete {property.name}? <br />
                    This action cannot be undone.
                  </DeleteConfirmDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  } else {
    propertiesContent = (
      <div className="flex min-h-[489.5px] items-center justify-center px-4 py-6 text-sm text-muted-foreground">
        No properties yet.
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LucideTags className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-semibold">Properties</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage property definitions and lookup codes.
          </p>
        </div>
        <PropertySheet
          onSaved={reloadProperties}
          trigger={
            <Button className="w-fit font-medium" type="button" variant="success" size="lg">
              <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
              Add
            </Button>
          }
        />
      </div>

      <Separator />

      <div className="overflow-hidden rounded-lg border bg-card">
        <form
          className="grid gap-3 border-b px-4 py-4 lg:grid-cols-[minmax(220px,1fr)_minmax(180px,260px)_auto] lg:items-end"
          onSubmit={handleSearch}
        >
          <div className="grid gap-2">
            <Label htmlFor="property-name">Name</Label>
            <Input
              id="property-name"
              onChange={(event) =>
                setFilters((value) => ({
                  ...value,
                  name: event.target.value,
                }))
              }
              placeholder="Search name"
              value={filters.name}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="property-code">Code</Label>
            <Input
              id="property-code"
              onChange={(event) =>
                setFilters((value) => ({
                  ...value,
                  code: event.target.value,
                }))
              }
              placeholder="Search code"
              value={filters.code}
            />
          </div>

          <Button
            className="w-full lg:w-auto"
            isLoading={isLoading}
            size="lg"
            type="submit"
            variant="info"
          >
            <UilSearch aria-hidden="true" data-icon="inline-start" />
            Search
          </Button>
        </form>

        {propertiesContent}

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
