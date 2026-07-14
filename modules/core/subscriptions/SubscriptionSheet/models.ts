import type { ReactNode } from "react";

import type { BillingCycle, Subscription } from "@/modules/core/subscriptions/models";

export type SubscriptionSheetMode = "create" | "view" | "edit";

export type SubscriptionSheetFormState = {
  amount: string;
  billingCycle: BillingCycle;
  billingDay: string;
  billingMonth: string;
  category: string;
  endDate?: Date;
  name: string;
  note: string;
  startDate?: Date;
};

export type SubscriptionSheetProps = {
  mode: SubscriptionSheetMode;
  onSaved?: () => void;
  subscription?: Subscription;
  trigger: ReactNode;
};
