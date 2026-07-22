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
import { Checkbox } from "@/components/ui/checkbox";
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
  createTransportationExpense,
  deleteTransportationExpense,
  getTransportationExpensesErrorMessage,
  updateTransportationExpense,
} from "@/modules/core/transportation-expenses/functions";

import {
  buildTransportationExpenseSheetPayload,
  formatDatePickerLabel,
  getDefaultTransportationExpenseSheetForm,
  getTransportationExpenseSheetFormFromTransportationExpense,
  getTransportationExpenseSheetTitle,
} from "./functions";
import type {
  TransportationExpenseSheetFormState,
  TransportationExpenseSheetMode,
  TransportationExpenseSheetProps,
} from "./models";

type TransportationExpenseDatePickerProps = {
  date?: Date;
  disabled?: boolean;
  onSelect: (date?: Date) => void;
};

const TransportationExpenseDatePicker = ({
  date,
  disabled,
  onSelect,
}: TransportationExpenseDatePickerProps) => {
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

export const TransportationExpenseSheet = ({
  mode,
  onSaved,
  transportationExpense,
  trigger,
}: TransportationExpenseSheetProps) => {
  const [open, setOpen] = useState(false);
  const initialForm = useMemo(
    () => getTransportationExpenseSheetFormFromTransportationExpense(transportationExpense),
    [transportationExpense],
  );
  const [form, setForm] = useState<TransportationExpenseSheetFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalMode, setInternalMode] = useState<TransportationExpenseSheetMode>(mode);
  const [categoryOptions, setCategoryOptions] = useState<
    CachedPropertyOption[]
  >([]);

  const isViewMode = internalMode === "view";
  const isEditMode = internalMode === "edit";
  const isCreateMode = internalMode === "create";
  const title = getTransportationExpenseSheetTitle(internalMode);
  const updateOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setInternalMode(mode);
      setForm(initialForm);
      setCategoryOptions(
        getCachedPropertyOptions(PROPERTY_TYPES.TRAVEL_EXPENSES),
      );
    }

    setOpen(nextOpen);
  };

  const resetToViewMode = () => {
    setForm(initialForm);
    setInternalMode("view");
  };

  const resetForm = () => {
    setForm(isCreateMode ? getDefaultTransportationExpenseSheetForm() : initialForm);
  };

  const handleDelete = async () => {
    if (!transportationExpense?.id) {
      appToast.error("Transportation expense id is required.");
      return;
    }

    try {
      await deleteTransportationExpense(transportationExpense.id);
      appToast.success("Transportation expense deleted.");
      updateOpen(false);
      onSaved?.();
    } catch (error) {
      appToast.error(getTransportationExpensesErrorMessage(error));
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
      !form.expenseDate ||
      !form.expenseTime
    ) {
      appToast.error(
        "Please fill title, category, expense date, and time.",
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
      const payload = buildTransportationExpenseSheetPayload(form);

      if (isEditMode) {
        if (!transportationExpense?.id) {
          throw new Error("Transportation expense id is required.");
        }

        await updateTransportationExpense(transportationExpense.id, payload);
        appToast.success("Transportation expense updated.");
      } else {
        await createTransportationExpense(payload);
        appToast.success("Transportation expense added.");
      }

      updateOpen(false);
      onSaved?.();
    } catch (error) {
      appToast.error(getTransportationExpensesErrorMessage(error));
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
                <Label htmlFor={`${internalMode}-transportation-expense-amount`}>
                  Amount (THB)
                </Label>
                <Input
                  disabled={isViewMode}
                  id={`${internalMode}-transportation-expense-amount`}
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
              <Label htmlFor={`${internalMode}-transportation-expense-title`}>Title</Label>
              <Input
                disabled={isViewMode}
                id={`${internalMode}-transportation-expense-title`}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    title: event.target.value,
                  }))
                }
                placeholder="Transportation expense title"
                value={form.title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${internalMode}-transportation-expense-category`}>
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
                  id={`${internalMode}-transportation-expense-category`}
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
                <Label>Expense date</Label>
                <TransportationExpenseDatePicker
                  date={form.expenseDate}
                  disabled={isViewMode}
                  onSelect={(expenseDate) =>
                    setForm((value) => ({
                      ...value,
                      expenseDate,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`${internalMode}-transportation-expense-time`}>Time</Label>
                <Input
                  disabled={isViewMode}
                  id={`${internalMode}-transportation-expense-time`}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      expenseTime: event.target.value,
                    }))
                  }
                  type="time"
                  value={form.expenseTime}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${internalMode}-transportation-expense-note`}>Note</Label>
              <Textarea
                className="min-h-24 resize-none"
                disabled={isViewMode}
                id={`${internalMode}-transportation-expense-note`}
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

            <div className="flex items-center gap-3 rounded-md border p-3">
              <Checkbox
                checked={form.syncToTransaction}
                disabled={isViewMode}
                id={`${internalMode}-transportation-expense-sync`}
                onCheckedChange={(checked) =>
                  setForm((value) => ({
                    ...value,
                    syncToTransaction: checked === true,
                  }))
                }
              />
              <Label
                className="cursor-pointer font-normal"
                htmlFor={`${internalMode}-transportation-expense-sync`}
              >
                Sync this expense to Transactions
              </Label>
            </div>
          </div>

          {isViewMode ? (
            <SheetFooter className="border-t sm:flex-row sm:justify-end">
              <DeleteConfirmDialog
                ariaLabel="Delete transportation expense"
                onConfirm={handleDelete}
                title="Delete transportation expense"
                trigger={
                  <Button type="button" variant="danger" size="lg">
                    <UilTrashAlt aria-hidden="true" data-icon="inline-start" />
                    Delete
                  </Button>
                }
              >
                Are you sure you want to delete{" "}
                {transportationExpense?.title || "this transportation expense"}? <br />
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
                {isEditMode
                  ? "Save transportation expense"
                  : "Add transportation expense"}
              </Button>
            </SheetFooter>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
};
