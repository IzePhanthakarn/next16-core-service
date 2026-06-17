"use client";

import { type ReactNode, useState } from "react";

import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
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

import { createPropertyOption, getPropertyDetailErrorMessage } from "./functions";
import type { PropertyOption } from "./models";
import { UilRedo } from "@/assets/icons/UilRedo";

type AddOptionSheetProps = {
  propertyTypeId: string;
  onSaved?: (option: PropertyOption) => void;
  trigger: ReactNode;
};

type AddOptionFormState = {
  label: string;
  value: string;
};

const defaultForm: AddOptionFormState = {
  label: "",
  value: "",
};

export const AddOptionSheet = ({
  propertyTypeId,
  onSaved,
  trigger,
}: AddOptionSheetProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AddOptionFormState>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setForm(defaultForm);
  };

  const updateOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      resetForm();
    }
    setOpen(nextOpen);
  };

  const handleSubmit = async () => {
    if (!form.label.trim() || !form.value.trim()) {
      appToast.error("Please fill label and value.");
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await createPropertyOption({
        label: form.label.trim(),
        value: form.value.trim(),
        property_type_id: propertyTypeId,
      });
      appToast.success("Option added.");
      updateOpen(false);
      onSaved?.(created);
    } catch (error) {
      appToast.error(getPropertyDetailErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={updateOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>Add Option</SheetTitle>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-option-label">Label</Label>
              <Input
                id="add-option-label"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="Option label"
                value={form.label}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-option-value">Value</Label>
              <Input
                id="add-option-value"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, value: e.target.value }))
                }
                placeholder="Option value"
                value={form.value}
              />
            </div>
          </div>

          <SheetFooter className="border-t sm:flex-row sm:justify-end">
            <Button
              disabled={isSubmitting}
              onClick={resetForm}
              type="button"
              variant="outline"
            >
              <UilRedo aria-hidden="true" data-icon="inline-start" />
              Reset form
            </Button>
            <Button isLoading={isSubmitting} type="submit" variant="success">
              <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
              Add Option
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
