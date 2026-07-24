import { LucideTags } from "@/assets/icons/LucideTags";
import { LucideWallet } from "@/assets/icons/LucideWallet";
import { UilCalendarAlt } from "@/assets/icons/UilCalendarAlt";
import { UilClipboardNotes } from "@/assets/icons/UilClipboardNotes";
import { Money } from "@/components/core/money";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { getCategoryLabel } from "../functions";
import { getExpenseBarWidth } from "./functions";
import type { TransactionStatsGridProps } from "./models";

export const StatsGrid = ({ stats }: TransactionStatsGridProps) => {
  const netCashFlow = stats.total_income - stats.total_expense;
  const highestExpense = stats.top_expense_category[0]?.total_amount ?? 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="overflow-hidden rounded-lg border bg-card">
        <div
          className={cn(
            "flex items-start justify-between gap-4 p-4",
            netCashFlow > 0 && "bg-green-600/5",
            netCashFlow < 0 && "bg-red-600/5",
            netCashFlow === 0 && "bg-muted/50",
          )}
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Net Cash Flow
            </p>
            <p
              className={cn(
                "mt-1 text-3xl font-semibold",
                netCashFlow > 0 && "text-green-700 dark:text-green-400",
                netCashFlow < 0 && "text-red-700 dark:text-red-400",
              )}
            >
              {netCashFlow > 0 && "+"}
              <Money amount={netCashFlow} />
            </p>
          </div>
          <div
            className={cn(
              "rounded-full p-3",
              netCashFlow > 0 &&
                "bg-green-600/10 text-green-700 dark:text-green-400",
              netCashFlow < 0 &&
                "bg-red-600/10 text-red-700 dark:text-red-400",
              netCashFlow === 0 && "bg-muted text-muted-foreground",
            )}
          >
            <LucideWallet className="h-7 w-7" />
          </div>
        </div>

        <Separator />

        <div className="grid sm:grid-cols-2">
          <div className="p-4 sm:border-r">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Income
            </p>
            <p className="mt-1 text-xl font-semibold text-green-700 dark:text-green-400">
              +<Money amount={stats.total_income} />
            </p>
          </div>
          <div className="border-t p-4 sm:border-t-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Expense
            </p>
            <p className="mt-1 text-xl font-semibold text-red-700 dark:text-red-400">
              -<Money amount={stats.total_expense} />
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 p-4">
          <div className="flex items-center gap-3">
            <UilCalendarAlt className="h-8 w-8 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                Daily Average
              </p>
              <p className="font-semibold">
                <Money amount={stats.average_daily_expense} />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UilClipboardNotes className="h-8 w-8 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                Transactions
              </p>
              <p className="font-semibold tabular-nums">
                {stats.transaction_count} items
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-64 flex-col rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <LucideTags className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Top Expense Categories</h2>
            <p className="text-xs text-muted-foreground">
              Ranked by total spending
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        {stats.top_expense_category.length ? (
          <div className="flex flex-1 flex-col justify-center gap-4">
            {stats.top_expense_category.map((expense, index) => (
              <div key={expense.category} className="space-y-1.5">
                <div className="flex items-end justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <span className="mr-2 text-xs font-semibold text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium">
                      {getCategoryLabel("expense", expense.category)}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {expense.count} {expense.count === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <span className="shrink-0 font-semibold">
                    <Money amount={expense.total_amount} />
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{
                      width: `${getExpenseBarWidth(
                        expense.total_amount,
                        highestExpense,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            No expense categories for this period.
          </div>
        )}
      </div>
    </div>
  );
};
