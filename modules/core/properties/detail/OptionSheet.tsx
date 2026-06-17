"use client";

import { type ReactNode, useState } from "react";

import { UilPen } from "@/assets/icons/UilPen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { appToast } from "@/lib/toast";

import { getPropertyDetailErrorMessage, updatePropertyOption } from "./functions";
import type { PropertyOption } from "./models";

type OptionSheetMode = "view" | "edit";

type OptionSheetProps = {
  mode: OptionSheetMode;
  onSaved?: (option: PropertyOption) => void;
  option: PropertyOption;
  trigger: ReactNode;
};

const getTitle = (mode: OptionSheetMode) => {
  if (mode === "view") {
    return "View Option";
  }
  return "Edit Option";
};

export const OptionSheet = ({ mode, onSaved, option, trigger }: OptionSheetProps) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(option.label);
  const [value, setValue] = useState(option.value);
  const [isActive, setIsActive] = useState(String(option.is_active));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isViewMode = mode === "view";

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setLabel(option.label);
      setValue(option.value);
      setIsActive(String(option.is_active));
    }
    setOpen(nextOpen);
  };

  const handleSave = async () => {
    if (!label.trim() || !value.trim()) {
      appToast.error("Please fill label and value.");
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = await updatePropertyOption({
        id: option.id,
        label: label.trim(),
        value: value.trim(),
        is_active: isActive === "true",
        sort_order: option.sort_order ?? 0,
      });
      appToast.success("Option saved.");
      setOpen(false);
      onSaved?.(updated);
    } catch (error) {
      appToast.error(getPropertyDetailErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>{getTitle(mode)}</SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor={`${mode}-option-label`}>Label</Label>
              <Input
                disabled={isViewMode}
                id={`${mode}-option-label`}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Option label"
                value={label}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${mode}-option-value`}>Value</Label>
              <Input
                disabled={isViewMode}
                id={`${mode}-option-value`}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Option value"
                value={value}
              />
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              {isViewMode ? (
                <Input
                  disabled
                  value={option.is_active ? "Active" : "Inactive"}
                />
              ) : (
                <Select onValueChange={setIsActive} value={isActive}>
                  <SelectTrigger className="h-9 w-full min-h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {!isViewMode ? (
            <SheetFooter className="border-t sm:flex-row sm:justify-end">
              <Button
                disabled={isSubmitting}
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
                size="lg"
              >
                Cancel
              </Button>
              <Button
                isLoading={isSubmitting}
                onClick={() => { void handleSave(); }}
                type="button"
                variant="warning"
                size="lg"
              >
                <UilPen aria-hidden="true" data-icon="inline-start" />
                Save Option
              </Button>
            </SheetFooter>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};
