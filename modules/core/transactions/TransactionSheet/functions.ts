import { bahtToSatang, satangToBaht } from "@/lib/currency";
import type {
  CreateTransactionInput,
  Transaction,
} from "@/modules/core/transactions/models";

import type { TransactionSheetFormState, TransactionSheetMode } from "./models";

// The <input type="time"> value is always "HH:mm" in 24-hour form.
export const formatTimeInputValue = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
};

export const getDefaultTransactionSheetForm = (): TransactionSheetFormState => ({
  amount: "",
  category: "",
  note: "",
  title: "",
  transactionDate: new Date(),
  transactionTime: formatTimeInputValue(new Date()),
  type: "expense",
});

export const getTransactionSheetTitle = (mode: TransactionSheetMode) => {
  if (mode === "view") {
    return "View transaction";
  }

  if (mode === "edit") {
    return "Edit transaction";
  }

  return "Add transaction";
};

export { formatDatePickerLabel } from "@/lib/date";

export const getTransactionSheetFormFromTransaction = (
  transaction?: Transaction
): TransactionSheetFormState => {
  if (!transaction) {
    return getDefaultTransactionSheetForm();
  }

  const transactionDate = new Date(transaction.transaction_date);

  return {
    amount: satangToBaht(transaction.amount).toFixed(2),
    category: transaction.category,
    note: transaction.note ?? "",
    title: transaction.title,
    transactionDate,
    transactionTime: formatTimeInputValue(transactionDate),
    type: transaction.type,
  };
};

// The date picker and the time input hold two halves of one timestamp.
export const mergeDateAndTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const merged = new Date(date);

  merged.setHours(hours, minutes, 0, 0);

  return merged;
};

export const buildTransactionSheetPayload = (
  form: TransactionSheetFormState
): CreateTransactionInput => {
  if (!form.transactionDate) {
    throw new Error("Transaction date is required.");
  }

  if (!form.transactionTime) {
    throw new Error("Transaction time is required.");
  }

  const note = form.note.trim();

  return {
    amount: bahtToSatang(Number(form.amount)),
    category: form.category.trim(),
    note: note || null,
    title: form.title.trim(),
    transaction_date: mergeDateAndTime(
      form.transactionDate,
      form.transactionTime
    ).toISOString(),
    type: form.type,
  };
};
