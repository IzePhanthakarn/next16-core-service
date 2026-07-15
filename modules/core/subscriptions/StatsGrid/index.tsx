"use client";

import { LucideRepeat } from "@/assets/icons/LucideRepeat";
import { LucideTags } from "@/assets/icons/LucideTags";
import { LucideWallet } from "@/assets/icons/LucideWallet";
import { UilCalendarAlt } from "@/assets/icons/UilCalendarAlt";
import { CircularProgress } from "@/components/ui/circular-progrss";
import { Separator } from "@/components/ui/separator";
import { formatAmount } from "@/lib/currency";
import { cn } from "@/lib/utils";

import { getCategoryLabel } from "../functions";
import {
  buildCategoryRows,
  getCategorySegmentColor,
  getPercentage,
} from "./functions";
import { type SubscriptionStatsGridProps } from "./models";

const Money = ({ amount }: { amount: number }) => (
  <span className="tabular-nums">
    {formatAmount(amount)}
    <span className="ml-1 text-xs font-normal text-muted-foreground">THB</span>
  </span>
);

export const StatsGrid = ({ stats }: SubscriptionStatsGridProps) => {
  const categoryRows = buildCategoryRows(
    stats.category_breakdown,
    getCategoryLabel,
  );
  const categoryTotal = categoryRows.reduce(
    (total, row) => total + row.monthly_amount,
    0,
  );
  const cycleTotal = stats.cycle_split.monthly_count + stats.cycle_split.yearly_count;
  const monthlyCycleWidth = getPercentage(stats.cycle_split.monthly_count, cycleTotal);
  const yearlyCycleWidth = 100 - monthlyCycleWidth;
  const passedValue = getPercentage(
    stats.passed_this_month.count,
    stats.active_count,
  );

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="flex flex-col justify-between gap-2 rounded-lg border bg-card p-2 md:col-span-2">
        <div className="flex items-center gap-3">
          <div className="flex w-full flex-col">
            <p className="text-sm font-medium text-muted-foreground">
              Monthly Recurring
            </p>
            <p className="text-lg font-semibold">
              <Money amount={stats.monthly_recurring} />
            </p>
          </div>
          <Separator orientation="vertical" />
          <div className="flex w-full flex-col">
            <p className="text-sm font-medium text-muted-foreground">
              Yearly Estimate
            </p>
            <p className="text-lg font-semibold">
              <Money amount={stats.yearly_estimate} />
            </p>
          </div>
          <Separator orientation="vertical" />
          <div className="flex w-full flex-col">
            <p className="text-sm font-medium text-muted-foreground">Active</p>
            <p className="text-lg font-semibold tabular-nums">
              {stats.active_count}
              <span className="text-sm font-normal text-muted-foreground">
                /{stats.total_count}
              </span>
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <LucideTags className="h-4 w-4" />
            Category Breakdown
          </div>
          {categoryRows.length ? (
            <div className="flex flex-col gap-2">
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                {categoryRows.map((row, index) => (
                  <div
                    key={row.label}
                    aria-label={`${row.label} monthly share`}
                    className={getCategorySegmentColor(index)}
                    style={{
                      width: `${getPercentage(row.monthly_amount, categoryTotal)}%`,
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {categoryRows.map((row, index) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        getCategorySegmentColor(index),
                      )}
                    />
                    <span className="font-medium">{row.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatAmount(row.monthly_amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No active subscriptions yet.
            </p>
          )}
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <LucideRepeat className="h-4 w-4" />
              Billing Cycle
            </div>
            <span className="text-xs">
              Monthly {stats.cycle_split.monthly_count} · Yearly{" "}
              {stats.cycle_split.yearly_count}
            </span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="bg-primary" style={{ width: `${monthlyCycleWidth}%` }} />
            <div className="bg-blue-500" style={{ width: `${yearlyCycleWidth}%` }} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-lg border bg-card p-4 md:col-span-2">
        <CircularProgress
          circleStrokeWidth={5}
          progressBgClassName="text-primary/10"
          progressClassName="text-primary duration-1000"
          progressStrokeWidth={9}
          renderLabel={() => (
            <div className="flex flex-col items-center">
              <UilCalendarAlt className="mb-0.5 h-10 w-10 text-primary duration-1000" />
              <div className="flex items-baseline">
                <span className="text-2xl font-medium tabular-nums text-primary">
                  {stats.passed_this_month.count}
                </span>
                <span className="ml-0.5 text-lg font-medium text-primary">
                  /{stats.active_count}
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Charged</p>
            </div>
          )}
          shape="round"
          showLabel
          size={160}
          trackDashArray="8 15"
          value={passedValue}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <p className="text-lg font-medium text-muted-foreground">
              Remaining This Month
            </p>
            <p className="text-2xl font-semibold">
              <Money amount={stats.remaining_this_month.amount} />
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
              <LucideWallet className="h-4 w-4" />
              Top Expenses
            </div>
            {stats.top_expenses.length ? (
              stats.top_expenses.map((expense, index) => (
                <div
                  key={`${expense.name}-${index}`}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="min-w-0 truncate">
                    {index + 1}. {expense.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatAmount(expense.monthly_amount)}/mo
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
