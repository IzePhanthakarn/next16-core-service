import type { ReactNode } from "react";

import type { TransportationExpense } from "@/modules/core/transportation-expenses/models";

export type TransportationExpenseSheetMode = "create" | "view" | "edit";

export type TransportationExpenseSheetFormState = {
  amount: string;
  category: string;
  note: string;
  title: string;
  expenseDate?: Date;
  expenseTime: string;
  syncToTransaction: boolean;
};

export type TransportationExpenseSheetProps = {
  mode: TransportationExpenseSheetMode;
  onSaved?: () => void;
  transportationExpense?: TransportationExpense;
  trigger: ReactNode;
};
