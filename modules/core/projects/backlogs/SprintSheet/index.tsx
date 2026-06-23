"use client";

import { type FormEvent, useState } from "react";
import { format } from "date-fns";

import { UilCalendar } from "@/assets/icons/UilCalendar";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilRedo } from "@/assets/icons/UilRedo";
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
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  createSprint,
  getProjectErrorMessage,
  updateSprint,
} from "@/modules/core/projects/functions";

import { getSprintForm, type SprintSheetFormState, type SprintSheetProps } from "./models";

type SprintDatePickerProps = {
  date?: Date;
  disabled?: boolean;
  onSelect: (date?: Date) => void;
};

const SprintDatePicker = ({
  date,
  disabled,
  onSelect,
}: SprintDatePickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "h-9 w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
          type="button"
          variant="outline"
        >
          <UilCalendar aria-hidden="true" data-icon="inline-start" />
          {date ? format(date, "d MMM yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Calendar
          mode="single"
          onSelect={(selected) => {
            onSelect(selected);
            setOpen(false);
          }}
          selected={date}
        />
      </PopoverContent>
    </Popover>
  );
};

export const SprintSheet = ({
  projectId,
  onSaved,
  sprint,
  trigger,
}: SprintSheetProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SprintSheetFormState>(() => getSprintForm(sprint));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(sprint);

  const updateOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setForm(getSprintForm(sprint));
    }
    setOpen(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      appToast.error("Please fill the sprint name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const input = {
        name: form.name.trim(),
        goal: form.goal.trim() || undefined,
        start_date: (form.startDate ?? new Date()).toISOString(),
        end_date: form.endDate?.toISOString(),
      };

      if (sprint) {
        await updateSprint(projectId, sprint.id, input);
      } else {
        await createSprint(projectId, input);
      }

      appToast.success(isEditing ? "Sprint updated." : "Sprint created.");
      updateOpen(false);
      onSaved?.();
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet onOpenChange={updateOpen} open={open}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>{isEditing ? "Edit sprint" : "New sprint"}</SheetTitle>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="sprint-name">Name</Label>
              <Input
                autoFocus
                id="sprint-name"
                maxLength={120}
                onChange={(event) =>
                  setForm((value) => ({ ...value, name: event.target.value }))
                }
                placeholder="e.g. Sprint 1"
                value={form.name}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sprint-goal">Goal</Label>
              <Textarea
                className="min-h-24 resize-none"
                id="sprint-goal"
                onChange={(event) =>
                  setForm((value) => ({ ...value, goal: event.target.value }))
                }
                placeholder="What should this sprint achieve?"
                value={form.goal}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Start date</Label>
                <SprintDatePicker
                  date={form.startDate}
                  onSelect={(startDate) =>
                    setForm((value) => ({ ...value, startDate }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>End date</Label>
                <SprintDatePicker
                  date={form.endDate}
                  onSelect={(endDate) =>
                    setForm((value) => ({ ...value, endDate }))
                  }
                />
              </div>
            </div>
          </div>

          <SheetFooter className="border-t sm:flex-row sm:justify-end">
            <Button
              disabled={isSubmitting}
              onClick={() => setForm(getSprintForm(sprint))}
              size="lg"
              type="button"
              variant="outline"
            >
              <UilRedo aria-hidden="true" data-icon="inline-start" />
              Reset form
            </Button>
            <Button isLoading={isSubmitting} size="lg" type="submit" variant="success">
              <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
              {isEditing ? "Save changes" : "Create sprint"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
