"use client";

import { type FormEvent, useMemo, useState } from "react";

import { UilCalendar } from "@/assets/icons/UilCalendar";
import { UilPen } from "@/assets/icons/UilPen";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilRedo } from "@/assets/icons/UilRedo";
import { UilTrashAlt } from "@/assets/icons/UilTrashAlt";
import { UilX } from "@/assets/icons/UilX";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import PROPERTY_TYPES from "@/constants/properties";
import {
  getCachedPropertyOptions,
  type CachedPropertyOption,
} from "@/lib/properties";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  createTransaction,
  deleteTransaction,
  getTransactionsErrorMessage,
  updateTransaction,
} from "@/modules/core/transactions/functions";
import { type TransactionType } from "@/modules/core/transactions/models";

import {
  buildTransactionSheetPayload,
  formatDatePickerLabel,
  getDefaultTransactionSheetForm,
  getTransactionSheetFormFromTransaction,
  getTransactionSheetTitle,
} from "./functions";
import type {
  TransactionSheetFormState,
  TransactionSheetMode,
  TransactionSheetProps,
} from "./models";

type TransactionDatePickerProps = {
  date?: Date;
  disabled?: boolean;
  onSelect: (date?: Date) => void;
};

const TransactionDatePicker = ({
  date,
  disabled,
  onSelect,
}: TransactionDatePickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full h-9 justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
          disabled={disabled}
          type="button"
          variant="outline"
        >
          <UilCalendar aria-hidden="true" data-icon="inline-start" />
          {formatDatePickerLabel(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onSelect(selectedDate);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export const TransactionSheet = ({
  mode,
  onSaved,
  transaction,
  trigger,
}: TransactionSheetProps) => {
  const [open, setOpen] = useState(false);
  const initialForm = useMemo(
    () => getTransactionSheetFormFromTransaction(transaction),
    [transaction],
  );
  const [form, setForm] = useState<TransactionSheetFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalMode, setInternalMode] = useState<TransactionSheetMode>(mode);
  const [typeOptions, setTypeOptions] = useState<CachedPropertyOption[]>([]);
  const [expenseCategoryOptions, setExpenseCategoryOptions] = useState<
    CachedPropertyOption[]
  >([]);
  const [incomeCategoryOptions, setIncomeCategoryOptions] = useState<
    CachedPropertyOption[]
  >([]);

  const isViewMode = internalMode === "view";
  const isEditMode = internalMode === "edit";
  const isCreateMode = internalMode === "create";
  const title = getTransactionSheetTitle(internalMode);
  const categoryOptions =
    form.type === "income" ? incomeCategoryOptions : expenseCategoryOptions;

  const updateOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setInternalMode(mode);
      setForm(initialForm);
      setTypeOptions(getCachedPropertyOptions(PROPERTY_TYPES.TRANSACTION_TYPE));
      setExpenseCategoryOptions(
        getCachedPropertyOptions(PROPERTY_TYPES.TRANSACTION_EXPENSE_CATEGORY),
      );
      setIncomeCategoryOptions(
        getCachedPropertyOptions(PROPERTY_TYPES.TRANSACTION_INCOME_CATEGORY),
      );
    }

    setOpen(nextOpen);
  };

  const resetToViewMode = () => {
    setForm(initialForm);
    setInternalMode("view");
  };

  const resetForm = () => {
    setForm(isCreateMode ? getDefaultTransactionSheetForm() : initialForm);
  };

  const handleDelete = async () => {
    if (!transaction?.id) {
      appToast.error("Transaction id is required.");
      return;
    }

    try {
      await deleteTransaction(transaction.id);
      appToast.success("Transaction deleted.");
      updateOpen(false);
      onSaved?.();
    } catch (error) {
      appToast.error(getTransactionsErrorMessage(error));
      throw error;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isViewMode) {
      return;
    }

    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.transactionDate ||
      !form.transactionTime
    ) {
      appToast.error(
        "Please fill title, category, transaction date, and time.",
      );
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      appToast.error("Amount must be greater than 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildTransactionSheetPayload(form);

      if (isEditMode) {
        if (!transaction?.id) {
          throw new Error("Transaction id is required.");
        }

        await updateTransaction(transaction.id, payload);
        appToast.success("Transaction updated.");
      } else {
        await createTransaction(payload);
        appToast.success("Transaction added.");
      }

      updateOpen(false);
      onSaved?.();
    } catch (error) {
      appToast.error(getTransactionsErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={updateOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`${internalMode}-transaction-type`}>Type</Label>
                <Select
                  disabled={isViewMode}
                  onValueChange={(type) =>
                    setForm((value) => ({
                      ...value,
                      category: "",
                      type: type as TransactionType,
                    }))
                  }
                  value={form.type}
                >
                  <SelectTrigger className="w-full h-9 min-h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`${internalMode}-transaction-amount`}>
                  Amount (THB)
                </Label>
                <Input
                  disabled={isViewMode}
                  id={`${internalMode}-transaction-amount`}
                  inputMode="decimal"
                  min="0.01"
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={form.amount}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${internalMode}-transaction-title`}>Title</Label>
              <Input
                disabled={isViewMode}
                id={`${internalMode}-transaction-title`}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    title: event.target.value,
                  }))
                }
                placeholder="Transaction title"
                value={form.title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${internalMode}-transaction-category`}>
                Category
              </Label>
              <Select
                disabled={isViewMode}
                onValueChange={(category) =>
                  setForm((value) => ({
                    ...value,
                    category,
                  }))
                }
                value={form.category}
              >
                <SelectTrigger
                  className="w-full h-9 min-h-9"
                  id={`${internalMode}-transaction-category`}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
              <div className="grid gap-2">
                <Label>Transaction date</Label>
                <TransactionDatePicker
                  date={form.transactionDate}
                  disabled={isViewMode}
                  onSelect={(transactionDate) =>
                    setForm((value) => ({
                      ...value,
                      transactionDate,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`${internalMode}-transaction-time`}>Time</Label>
                <Input
                  disabled={isViewMode}
                  id={`${internalMode}-transaction-time`}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      transactionTime: event.target.value,
                    }))
                  }
                  type="time"
                  value={form.transactionTime}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${internalMode}-transaction-note`}>Note</Label>
              <Textarea
                className="min-h-24 resize-none"
                disabled={isViewMode}
                id={`${internalMode}-transaction-note`}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    note: event.target.value,
                  }))
                }
                placeholder="Optional note"
                value={form.note}
              />
            </div>
          </div>

          {isViewMode ? (
            <SheetFooter className="border-t sm:flex-row sm:justify-end">
              <DeleteConfirmDialog
                ariaLabel="Delete transaction"
                onConfirm={handleDelete}
                title="Delete transaction"
                trigger={
                  <Button type="button" variant="danger" size="lg">
                    <UilTrashAlt aria-hidden="true" data-icon="inline-start" />
                    Delete
                  </Button>
                }
              >
                Are you sure you want to delete{" "}
                {transaction?.title || "this transaction"}? <br />
                This action cannot be undone.
              </DeleteConfirmDialog>
              <Button
                onClick={(event) => {
                  event.preventDefault();
                  setInternalMode("edit");
                }}
                type="button"
                variant="secondary"
                size="lg"
              >
                <UilPen aria-hidden="true" data-icon="inline-start" />
                Edit
              </Button>
            </SheetFooter>
          ) : (
            <SheetFooter className="border-t sm:flex-row sm:justify-end">
              {isEditMode ? (
                <Button
                  disabled={isSubmitting}
                  onClick={resetToViewMode}
                  type="button"
                  variant="outline"
                  size="lg"
                >
                  <UilX aria-hidden="true" data-icon="inline-start" />
                  Cancel
                </Button>
              ) : (
                <Button
                  disabled={isSubmitting}
                  onClick={resetForm}
                  type="button"
                  variant="outline"
                  size="lg"
                >
                  <UilRedo aria-hidden="true" data-icon="inline-start" />
                  Reset form
                </Button>
              )}
              <Button
                isLoading={isSubmitting}
                type="submit"
                size="lg"
                variant={isEditMode ? "warning" : "success"}
              >
                {isEditMode ? (
                  <UilPen aria-hidden="true" data-icon="inline-start" />
                ) : (
                  <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
                )}
                {isEditMode ? "Save transaction" : "Add transaction"}
              </Button>
            </SheetFooter>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
};
