import { bahtToSatang, satangToBaht } from "@/lib/currency";
import type {
  CreateTransportationExpenseInput,
  TransportationExpense,
} from "@/modules/core/transportation-expenses/models";

import type {
  TransportationExpenseSheetFormState,
  TransportationExpenseSheetMode,
} from "./models";

export const formatTimeInputValue = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
};

export const getDefaultTransportationExpenseSheetForm =
  (): TransportationExpenseSheetFormState => {
    const now = new Date();

    return {
      amount: "",
      category: "",
      note: "",
      title: "",
      expenseDate: now,
      expenseTime: formatTimeInputValue(now),
      syncToTransaction: false,
    };
  };

export const getTransportationExpenseSheetTitle = (
  mode: TransportationExpenseSheetMode,
) => {
  if (mode === "view") return "View transportation expense";
  if (mode === "edit") return "Edit transportation expense";
  return "Add transportation expense";
};

export { formatDatePickerLabel } from "@/lib/date";

export const getTransportationExpenseSheetFormFromTransportationExpense = (
  expense?: TransportationExpense,
): TransportationExpenseSheetFormState => {
  if (!expense) return getDefaultTransportationExpenseSheetForm();

  const expenseDate = new Date(expense.expense_date);

  return {
    amount: satangToBaht(expense.amount).toFixed(2),
    category: expense.category,
    note: expense.note ?? "",
    title: expense.title,
    expenseDate,
    expenseTime: formatTimeInputValue(expenseDate),
    syncToTransaction: Boolean(expense.transaction_id),
  };
};

export const mergeDateAndTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const merged = new Date(date);
  merged.setHours(hours, minutes, 0, 0);
  return merged;
};

export const buildTransportationExpenseSheetPayload = (
  form: TransportationExpenseSheetFormState,
): CreateTransportationExpenseInput => {
  if (!form.expenseDate) throw new Error("Expense date is required.");
  if (!form.expenseTime) throw new Error("Expense time is required.");

  const note = form.note.trim();

  return {
    amount: bahtToSatang(Number(form.amount)),
    category: form.category.trim(),
    expense_date: mergeDateAndTime(
      form.expenseDate,
      form.expenseTime,
    ).toISOString(),
    note: note || null,
    sync_to_transaction: form.syncToTransaction,
    title: form.title.trim(),
  };
};
