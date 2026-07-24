import type { SubscriptionCategoryStat } from "../models";
import { categoryBreakdownLimit } from "./models";

export type CategoryRow = {
  label: string;
  monthly_amount: number;
  count: number;
};

export { getPercentage } from "@/lib/percentage";

// Cycled through the category segments so each slice of the single bar (and its
// matching legend dot) stays visually distinct.
const CATEGORY_SEGMENT_COLORS = [
  "bg-primary",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
] as const;

export const getCategorySegmentColor = (index: number) =>
  CATEGORY_SEGMENT_COLORS[index % CATEGORY_SEGMENT_COLORS.length];

// Resolve each category to a display row, keeping the top ones and folding the
// remainder into a single "Other" bucket so the list never grows unbounded.
export const buildCategoryRows = (
  categories: SubscriptionCategoryStat[],
  getCategoryLabel: (category: string | null) => string,
): CategoryRow[] => {
  const toLabel = (category: string | null) =>
    category ? getCategoryLabel(category) : "Uncategorized";

  if (categories.length <= categoryBreakdownLimit) {
    return categories.map((category) => ({
      label: toLabel(category.category),
      monthly_amount: category.monthly_amount,
      count: category.count,
    }));
  }

  const visible = categories.slice(0, categoryBreakdownLimit).map((category) => ({
    label: toLabel(category.category),
    monthly_amount: category.monthly_amount,
    count: category.count,
  }));

  const other = categories
    .slice(categoryBreakdownLimit)
    .reduce<CategoryRow>(
      (accumulator, category) => ({
        label: accumulator.label,
        monthly_amount: accumulator.monthly_amount + category.monthly_amount,
        count: accumulator.count + category.count,
      }),
      { label: "Other", monthly_amount: 0, count: 0 },
    );

  return [...visible, other];
};
