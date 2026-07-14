export type BillingCycle = "monthly" | "yearly";

export type Subscription = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  billing_cycle: BillingCycle;
  billing_day: number;
  billing_month: number | null;
  category: string | null;
  note: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ApiResponse<T> = {
  status: string;
  code: number;
  message: string;
  data: T;
};

export type DeleteResponse = {
  status: string;
  code: number;
  message: string;
};

export type SubscriptionsQuery = {
  billing_cycle?: BillingCycle;
  is_active?: boolean;
  keyword?: string;
};

// `billing_month` is required when the cycle is yearly and must be left out
// entirely when it is monthly — sending it anyway is a 400.
export type CreateSubscriptionInput = {
  name: string;
  amount: number;
  billing_cycle: BillingCycle;
  billing_day: number;
  billing_month?: number;
  category: string | null;
  note: string | null;
  start_date: string;
  end_date: string | null;
};

export type UpdateSubscriptionInput = CreateSubscriptionInput;

// Sentinel for the "no filter" choice, since a Select item cannot hold an
// empty value.
export const allFilterValue = "all";

// Not a property: billing_day is just the 1-31 range the API accepts.
export const billingDayOptions = Array.from({ length: 31 }, (_, index) =>
  (index + 1).toString(),
);

export const itemPerPageOptions = [10, 20, 50] as const;
