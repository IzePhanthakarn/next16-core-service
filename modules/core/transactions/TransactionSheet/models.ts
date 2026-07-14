import type { ReactNode } from "react";

import type { Transaction, TransactionType } from "@/modules/core/transactions/models";

export type TransactionSheetMode = "create" | "view" | "edit";

export type TransactionSheetFormState = {
  amount: string;
  category: string;
  note: string;
  title: string;
  transactionDate?: Date;
  transactionTime: string;
  type: TransactionType;
};

export type TransactionSheetProps = {
  mode: TransactionSheetMode;
  onSaved?: () => void;
  transaction?: Transaction;
  trigger: ReactNode;
};
