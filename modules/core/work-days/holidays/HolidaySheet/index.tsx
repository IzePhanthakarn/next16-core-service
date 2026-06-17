"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { appToast } from "@/lib/toast";

import {
  getDefaultHolidaySheetForm,
  getHolidaySyncErrorMessage,
  syncHolidays,
} from "./functions";
import type { HolidaySheetFormState, HolidaySheetProps } from "./models";
import { UilSync } from "@/assets/icons/UilSync";
import { UilRedo } from "@/assets/icons/UilRedo";

export const HolidaySheet = ({ onSynced, trigger }: HolidaySheetProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<HolidaySheetFormState>(
    getDefaultHolidaySheetForm(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setForm(getDefaultHolidaySheetForm());
  };

  const updateOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      resetForm();
    }
    setOpen(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.path.trim()) {
      appToast.error("Please enter a source URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      await syncHolidays(form);
      appToast.success("Holidays synced successfully.");
      updateOpen(false);
      onSynced?.();
    } catch (error) {
      appToast.error(getHolidaySyncErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={updateOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>Sync Holidays</SheetTitle>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sync-holiday-path">Source URL</Label>
              <Input
                id="sync-holiday-path"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, path: event.target.value }))
                }
                placeholder="https://..."
                value={form.path}
              />
              <p className="text-xs text-muted-foreground">
                Enter the URL to fetch holiday data from. The data will be saved to the database.
              </p>
            </div>
          </div>

          <SheetFooter className="border-t sm:flex-row sm:justify-end">
            <Button
              disabled={isSubmitting}
              onClick={resetForm}
              type="button"
              variant="outline"
            >
              <UilRedo />
              Reset
            </Button>
            <Button isLoading={isSubmitting} type="submit" variant="info">
              <UilSync/>
              Sync
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
