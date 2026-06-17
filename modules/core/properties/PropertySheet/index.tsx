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
import { Textarea } from "@/components/ui/textarea";
import { appToast } from "@/lib/toast";
import {
  createProperty,
  getPropertiesErrorMessage,
} from "@/modules/core/properties/functions";

import {
  buildPropertySheetPayload,
  generatePropertyCode,
  getDefaultPropertySheetForm,
} from "./functions";
import type { PropertySheetFormState, PropertySheetProps } from "./models";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilRedo } from "@/assets/icons/UilRedo";

export const PropertySheet = ({ onSaved, trigger }: PropertySheetProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PropertySheetFormState>(
    getDefaultPropertySheetForm(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setForm(getDefaultPropertySheetForm());
  };

  const updateOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      resetForm();
    }

    setOpen(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.code.trim()) {
      appToast.error("Please fill name and code.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createProperty(buildPropertySheetPayload(form));
      appToast.success("Property added.");
      updateOpen(false);
      onSaved?.();
    } catch (error) {
      appToast.error(getPropertiesErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={updateOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>Add property</SheetTitle>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="create-property-name">Name</Label>
              <Input
                id="create-property-name"
                onChange={(event) => {
                  const name = event.target.value;

                  setForm((value) => ({
                    ...value,
                    name,
                    code: generatePropertyCode(name),
                  }));
                }}
                placeholder="Expense Type"
                value={form.name}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-property-code">Code</Label>
              <Input
                id="create-property-code"
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    code: event.target.value.toUpperCase(),
                  }))
                }
                placeholder="EXPENSE_TYPE"
                value={form.code}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-property-description">Description</Label>
              <Textarea
                className="min-h-32 resize-none"
                id="create-property-description"
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    description: event.target.value,
                  }))
                }
                placeholder="Property description"
                value={form.description}
              />
            </div>
          </div>

          <SheetFooter className="border-t sm:flex-row sm:justify-end">
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
            <Button isLoading={isSubmitting} type="submit" variant="success" size="lg">
              <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
              Add property
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
