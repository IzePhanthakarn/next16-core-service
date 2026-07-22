import { LucideTags } from "@/assets/icons/LucideTags";
import { LucideWallet } from "@/assets/icons/LucideWallet";
import { UilCalendarAlt } from "@/assets/icons/UilCalendarAlt";
import { UilClipboardNotes } from "@/assets/icons/UilClipboardNotes";
import { Separator } from "@/components/ui/separator";
import { formatAmount } from "@/lib/currency";

import { getTransportationExpenseCategoryLabel } from "../functions";
import {
  formatPercentage,
  getCategorySplitGradient,
  getChartColor,
} from "./functions";
import type { TransportationExpenseStatsGridProps } from "./models";

const Money = ({ amount }: { amount: number }) => (
  <span className="tabular-nums">
    {formatAmount(amount)}
    <span className="ml-1 text-xs font-normal text-muted-foreground">THB</span>
  </span>
);

export const StatsGrid = ({ stats }: TransportationExpenseStatsGridProps) => {
  const hasCategoryData = stats.category_split.length > 0;

  return (
    <div className="grid overflow-hidden rounded-lg border bg-card lg:grid-cols-[0.65fr_1.35fr]">
      <div className="grid min-w-0 grid-rows-3 lg:border-r">
        <div className="flex items-center gap-3 p-4">
          <div className="rounded-full bg-red-600/10 p-2.5 text-red-700 dark:text-red-400">
            <LucideWallet className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total Expense
            </p>
            <p className="mt-0.5 truncate text-lg font-semibold text-red-700 dark:text-red-400">
              <Money amount={stats.total_expense} />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t p-4">
          <div className="rounded-full bg-primary/10 p-2.5 text-primary">
            <UilCalendarAlt className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Per Active Day
            </p>
            <p className="mt-0.5 truncate text-lg font-semibold">
              <Money amount={stats.average_per_active_day} />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t p-4">
          <div className="rounded-full bg-primary/10 p-2.5 text-primary">
            <UilClipboardNotes className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Expenses
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {stats.expense_count} items
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-72 min-w-0 flex-col border-t p-4 lg:border-t-0">
        <div className="flex items-center gap-2">
          <LucideTags className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Expense Categories</h2>
            <p className="text-xs text-muted-foreground">
              Share of transportation spending
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        {hasCategoryData ? (
          <div className="grid flex-1 items-center gap-6 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="flex justify-center">
              <div
                aria-label="Transportation expense category split"
                className="grid h-32 w-32 place-items-center rounded-full"
                role="img"
                style={{
                  background: getCategorySplitGradient(stats.category_split),
                }}
              >
                <div className="h-20 w-20 rounded-full border bg-card shadow-sm" />
              </div>
            </div>

            <div className="grid gap-1 xl:grid-cols-2 xl:gap-x-6">
              {stats.category_split.map((category, index) => (
                <div
                  key={category.category}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getChartColor(index) }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {getTransportationExpenseCategoryLabel(
                        category.category,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.count}{" "}
                      {category.count === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      <Money amount={category.total_amount} />
                    </p>
                    <p className="text-xs font-medium tabular-nums text-muted-foreground">
                      {formatPercentage(category.percentage)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            No transportation expenses for this period.
          </div>
        )}
      </div>
    </div>
  );
};
