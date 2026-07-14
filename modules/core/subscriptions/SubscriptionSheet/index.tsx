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
  createSubscription,
  deleteSubscription,
  getSubscriptionsErrorMessage,
  updateSubscription,
} from "@/modules/core/subscriptions/functions";
import {
  billingDayOptions,
  type BillingCycle,
} from "@/modules/core/subscriptions/models";

import {
  buildSubscriptionSheetPayload,
  formatDatePickerLabel,
  getDefaultSubscriptionSheetForm,
  getSubscriptionSheetFormFromSubscription,
  getSubscriptionSheetTitle,
} from "./functions";
import type {
  SubscriptionSheetFormState,
  SubscriptionSheetMode,
  SubscriptionSheetProps,
} from "./models";

type SubscriptionDatePickerProps = {
  date?: Date;
  disabled?: boolean;
  onSelect: (date?: Date) => void;
  placeholder?: string;
};

const SubscriptionDatePicker = ({
  date,
  disabled,
  onSelect,
  placeholder,
}: SubscriptionDatePickerProps) => {
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
          {date ? formatDatePickerLabel(date) : (placeholder ?? "Select date")}
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

export const SubscriptionSheet = ({
  mode,
  onSaved,
  subscription,
  trigger,
}: SubscriptionSheetProps) => {
  const [open, setOpen] = useState(false);
  const initialForm = useMemo(
    () => getSubscriptionSheetFormFromSubscription(subscription),
    [subscription],
  );
  const [form, setForm] = useState<SubscriptionSheetFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalMode, setInternalMode] = useState<SubscriptionSheetMode>(mode);
  const [billingCycleOptions, setBillingCycleOptions] = useState<
    CachedPropertyOption[]
  >([]);
  const [monthOptions, setMonthOptions] = useState<CachedPropertyOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CachedPropertyOption[]>(
    [],
  );

  const isViewMode = internalMode === "view";
  const isEditMode = internalMode === "edit";
  const isCreateMode = internalMode === "create";
  const isYearly = form.billingCycle === "yearly";
  const title = getSubscriptionSheetTitle(internalMode);

  const updateOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setInternalMode(mode);
      setForm(initialForm);
      setBillingCycleOptions(
        getCachedPropertyOptions(PROPERTY_TYPES.BILLING_CYCLE),
      );
      setMonthOptions(getCachedPropertyOptions(PROPERTY_TYPES.MONTH));
      setCategoryOptions(
        getCachedPropertyOptions(PROPERTY_TYPES.TRANSACTION_EXPENSE_CATEGORY),
      );
    }

    setOpen(nextOpen);
  };

  const resetToViewMode = () => {
    setForm(initialForm);
    setInternalMode("view");
  };

  const resetForm = () => {
    setForm(isCreateMode ? getDefaultSubscriptionSheetForm() : initialForm);
  };

  const handleDelete = async () => {
    if (!subscription?.id) {
      appToast.error("Subscription id is required.");
      return;
    }

    try {
      await deleteSubscription(subscription.id);
      appToast.success("Subscription deleted.");
      updateOpen(false);
      onSaved?.();
    } catch (error) {
      appToast.error(getSubscriptionsErrorMessage(error));
      throw error;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isViewMode) {
      return;
    }

    if (!form.name.trim() || !form.billingDay || !form.startDate) {
      appToast.error("Please fill name, billing day, and start date.");
      return;
    }

    if (isYearly && !form.billingMonth) {
      appToast.error("Please select a billing month for a yearly cycle.");
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      appToast.error("Amount must be greater than 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildSubscriptionSheetPayload(form);

      if (isEditMode) {
        if (!subscription?.id) {
          throw new Error("Subscription id is required.");
        }

        await updateSubscription(subscription.id, payload);
        appToast.success("Subscription updated.");
      } else {
        await createSubscription(payload);
        appToast.success("Subscription added.");
      }

      updateOpen(false);
      onSaved?.();
    } catch (error) {
      appToast.error(getSubscriptionsErrorMessage(error));
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
            <div className="grid gap-2">
              <Label htmlFor={`${internalMode}-subscription-name`}>Name</Label>
              <Input
                disabled={isViewMode}
                id={`${internalMode}-subscription-name`}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    name: event.target.value,
                  }))
                }
                placeholder="Netflix, Domain, Internet..."
                value={form.name}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`${internalMode}-subscription-cycle`}>
                  Billing cycle
                </Label>
                <Select
                  disabled={isViewMode}
                  onValueChange={(billingCycle) =>
                    setForm((value) => ({
                      ...value,
                      billingCycle: billingCycle as BillingCycle,
                      // A monthly cycle must not carry a billing month.
                      billingMonth:
                        billingCycle === "yearly" ? value.billingMonth : "",
                    }))
                  }
                  value={form.billingCycle}
                >
                  <SelectTrigger
                    className="w-full h-9 min-h-9"
                    id={`${internalMode}-subscription-cycle`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {billingCycleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`${internalMode}-subscription-amount`}>
                  Amount (THB)
                </Label>
                <Input
                  disabled={isViewMode}
                  id={`${internalMode}-subscription-amount`}
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

            <div className="grid gap-3 sm:grid-cols-2">
              {isYearly && (
                <div className="grid gap-2">
                  <Label htmlFor={`${internalMode}-subscription-billing-month`}>
                    Billing month
                  </Label>
                  <Select
                    disabled={isViewMode}
                    onValueChange={(billingMonth) =>
                      setForm((value) => ({
                        ...value,
                        billingMonth,
                      }))
                    }
                    value={form.billingMonth}
                  >
                    <SelectTrigger
                      className="w-full h-9 min-h-9"
                      id={`${internalMode}-subscription-billing-month`}
                    >
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        {monthOptions.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor={`${internalMode}-subscription-billing-day`}>
                  Billing day
                </Label>
                <Select
                  disabled={isViewMode}
                  onValueChange={(billingDay) =>
                    setForm((value) => ({
                      ...value,
                      billingDay,
                    }))
                  }
                  value={form.billingDay}
                >
                  <SelectTrigger
                    className="w-full h-9 min-h-9"
                    id={`${internalMode}-subscription-billing-day`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {billingDayOptions.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${internalMode}-subscription-category`}>
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
                  id={`${internalMode}-subscription-category`}
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Start date</Label>
                <SubscriptionDatePicker
                  date={form.startDate}
                  disabled={isViewMode}
                  onSelect={(startDate) =>
                    setForm((value) => ({
                      ...value,
                      startDate,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>End date</Label>
                <SubscriptionDatePicker
                  date={form.endDate}
                  disabled={isViewMode}
                  onSelect={(endDate) =>
                    setForm((value) => ({
                      ...value,
                      endDate,
                    }))
                  }
                  placeholder="No end date"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${internalMode}-subscription-note`}>Note</Label>
              <Textarea
                className="min-h-24 resize-none"
                disabled={isViewMode}
                id={`${internalMode}-subscription-note`}
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
                ariaLabel="Delete subscription"
                onConfirm={handleDelete}
                title="Delete subscription"
                trigger={
                  <Button type="button" variant="danger" size="lg">
                    <UilTrashAlt aria-hidden="true" data-icon="inline-start" />
                    Delete
                  </Button>
                }
              >
                Are you sure you want to delete{" "}
                {subscription?.name || "this subscription"}? <br />
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
                {isEditMode ? "Save subscription" : "Add subscription"}
              </Button>
            </SheetFooter>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
};
