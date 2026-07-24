import { bahtToSatang, satangToBaht } from "@/lib/currency";
import type {
  CreateSubscriptionInput,
  Subscription,
} from "@/modules/core/subscriptions/models";

import type {
  SubscriptionSheetFormState,
  SubscriptionSheetMode,
} from "./models";

export const getDefaultSubscriptionSheetForm =
  (): SubscriptionSheetFormState => ({
    amount: "",
    billingCycle: "monthly",
    billingDay: "1",
    billingMonth: "",
    category: "",
    endDate: undefined,
    name: "",
    note: "",
    startDate: new Date(),
  });

export const getSubscriptionSheetTitle = (mode: SubscriptionSheetMode) => {
  if (mode === "view") {
    return "View subscription";
  }

  if (mode === "edit") {
    return "Edit subscription";
  }

  return "Add subscription";
};

export { formatDatePickerLabel } from "@/lib/date";

export const getSubscriptionSheetFormFromSubscription = (
  subscription?: Subscription,
): SubscriptionSheetFormState => {
  if (!subscription) {
    return getDefaultSubscriptionSheetForm();
  }

  return {
    amount: satangToBaht(subscription.amount).toFixed(2),
    billingCycle: subscription.billing_cycle,
    billingDay: subscription.billing_day.toString(),
    // The MONTH property options are zero-padded ("01".."12").
    billingMonth: subscription.billing_month
      ? subscription.billing_month.toString().padStart(2, "0")
      : "",
    category: subscription.category ?? "",
    endDate: subscription.end_date
      ? new Date(subscription.end_date)
      : undefined,
    name: subscription.name,
    note: subscription.note ?? "",
    startDate: new Date(subscription.start_date),
  };
};

export const buildSubscriptionSheetPayload = (
  form: SubscriptionSheetFormState,
): CreateSubscriptionInput => {
  if (!form.startDate) {
    throw new Error("Start date is required.");
  }

  const isYearly = form.billingCycle === "yearly";

  if (isYearly && !form.billingMonth) {
    throw new Error("Billing month is required for a yearly subscription.");
  }

  const category = form.category.trim();
  const note = form.note.trim();

  return {
    name: form.name.trim(),
    amount: bahtToSatang(Number(form.amount)),
    billing_cycle: form.billingCycle,
    billing_day: Number(form.billingDay),
    // Monthly must omit the key entirely, not send null.
    ...(isYearly ? { billing_month: Number(form.billingMonth) } : {}),
    category: category || null,
    note: note || null,
    start_date: form.startDate.toISOString(),
    end_date: form.endDate ? form.endDate.toISOString() : null,
  };
};
