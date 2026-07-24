import SUBSCRIPTIONS_API from "@/constants/api/subscriptions";
import PROPERTY_TYPES from "@/constants/properties";
import apiClient from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatMediumDate } from "@/lib/date";
import { getCachedPropertyOptions } from "@/lib/properties";

import {
  type ApiResponse,
  type CreateSubscriptionInput,
  type DeleteResponse,
  type Subscription,
  type SubscriptionsData,
  type SubscriptionsQuery,
  type UpdateSubscriptionInput,
} from "./models";

export { formatMediumDate as formatSubscriptionDate } from "@/lib/date";

export const getCategoryLabel = (category: string | null) => {
  if (!category) {
    return "-";
  }

  const options = getCachedPropertyOptions(
    PROPERTY_TYPES.TRANSACTION_EXPENSE_CATEGORY,
  );

  return options.find((option) => option.value === category)?.label ?? category;
};

// The backend does not clamp billing_day, so a subscription set to the 31st
// has no charge date in February. Fall back to the last day of the month.
const clampDayToMonth = (year: number, monthIndex: number, day: number) => {
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();

  return Math.min(day, lastDayOfMonth);
};

export const getNextBillingDate = (
  subscription: Subscription,
  from = new Date(),
) => {
  const today = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate(),
  );

  const buildDate = (year: number, monthIndex: number) =>
    new Date(
      year,
      monthIndex,
      clampDayToMonth(year, monthIndex, subscription.billing_day),
    );

  if (subscription.billing_cycle === "yearly") {
    const monthIndex = (subscription.billing_month ?? 1) - 1;
    const thisYear = buildDate(today.getFullYear(), monthIndex);

    return thisYear >= today
      ? thisYear
      : buildDate(today.getFullYear() + 1, monthIndex);
  }

  const thisMonth = buildDate(today.getFullYear(), today.getMonth());

  return thisMonth >= today
    ? thisMonth
    : buildDate(today.getFullYear(), today.getMonth() + 1);
};

export const formatNextBillingDate = (subscription: Subscription) => {
  if (!subscription.is_active) {
    return "-";
  }

  return formatMediumDate(getNextBillingDate(subscription));
};

export const getSubscriptions = async (query: SubscriptionsQuery = {}) => {
  const response = await apiClient.get<ApiResponse<SubscriptionsData>>(
    SUBSCRIPTIONS_API.ROOT,
    {
      params: query,
    },
  );

  return response.data.data;
};

export const createSubscription = async (input: CreateSubscriptionInput) => {
  const response = await apiClient.post<ApiResponse<Subscription>>(
    SUBSCRIPTIONS_API.ROOT,
    input,
  );

  return response.data.data;
};

export const updateSubscription = async (
  id: string,
  input: UpdateSubscriptionInput,
) => {
  const response = await apiClient.put<ApiResponse<Subscription>>(
    SUBSCRIPTIONS_API.DETAIL(id),
    input,
  );

  return response.data.data;
};

// `is_active` cannot be set through create or update, only flipped here.
export const toggleSubscription = async (id: string) => {
  const response = await apiClient.patch<ApiResponse<Subscription>>(
    SUBSCRIPTIONS_API.TOGGLE(id),
  );

  return response.data.data;
};

export const deleteSubscription = async (id: string) => {
  const response = await apiClient.delete<DeleteResponse>(
    SUBSCRIPTIONS_API.DETAIL(id),
  );

  return response.data;
};

export const getSubscriptionsErrorMessage = (error: unknown) =>
  getApiErrorMessage(error, "Failed to load subscriptions.");
