"use client";

import { useEffect, useState } from "react";

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
import { UilCalendar } from "@/assets/icons/UilCalendar";
import { UilPen } from "@/assets/icons/UilPen";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilRedo } from "@/assets/icons/UilRedo";
import { UilTrashAlt } from "@/assets/icons/UilTrashAlt";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

import { calendarEventTagOptions } from "../models";
import {
  buildEventSheetPayload,
  createCalendarEvent,
  deleteCalendarEvent,
  formatDatePickerLabel,
  getDefaultEventSheetForm,
  getEventSheetErrorMessage,
  getEventSheetFormFromEvent,
  getEventSheetTitle,
  updateCalendarEvent,
} from "./functions";
import type { EventSheetFormState, EventSheetMode, EventSheetProps } from "./models";

type DatePickerProps = {
  date?: Date;
  disabled?: boolean;
  onSelect: (date?: Date) => void;
};

const DatePicker = ({ date, disabled, onSelect }: DatePickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn("w-full h-9 justify-start text-left font-normal", !date && "text-muted-foreground")}
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

export const EventSheet = ({
  event,
  mode,
  onSaved,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: EventSheetProps) => {
  const isControlled = controlledOpen !== undefined;

  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;

  const [internalMode, setInternalMode] = useState<EventSheetMode>(mode);
  const [form, setForm] = useState<EventSheetFormState>(getEventSheetFormFromEvent(event));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isViewMode = internalMode === "view";
  const isEditMode = internalMode === "edit";
  const isCreateMode = internalMode === "create";

  useEffect(() => {
    if (open) {
      // Keep the sheet reset to the selected calendar event when it opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInternalMode(mode);
      setForm(getEventSheetFormFromEvent(event));
    }
  }, [open, mode, event]);

  const updateOpen = (nextOpen: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
  };

  const resetForm = () => {
    if (isCreateMode) {
      setForm(getDefaultEventSheetForm());
    } else {
      setForm(getEventSheetFormFromEvent(event));
    }
  };

  const submitForm = async () => {
    if (isViewMode) {
      return;
    }

    if (!form.title.trim()) {
      appToast.error("Please enter a title.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      appToast.error("Please select start and end dates.");
      return;
    }

    if (!form.tag) {
      appToast.error("Please select a tag.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildEventSheetPayload(form);

      if (isEditMode) {
        if (!event?.id) throw new Error("Event id is required.");
        await updateCalendarEvent(event.id, { ...payload, user_id: event.user_id });
        appToast.success("Event updated.");
      } else {
        await createCalendarEvent(payload);
        appToast.success("Event added.");
      }

      updateOpen(false);
      onSaved?.();
    } catch (error) {
      appToast.error(getEventSheetErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteEvent = async () => {
    if (!event?.id) {
      appToast.error("Event id is required.");
      return;
    }

    try {
      await deleteCalendarEvent(event.id);
      appToast.success("Event deleted.");
      updateOpen(false);
      onSaved?.();
    } catch (error) {
      appToast.error(getEventSheetErrorMessage(error));
      throw error;
    }
  };

  const title = getEventSheetTitle(internalMode);

  const sheetContent = (
    <SheetContent className="w-full sm:max-w-lg">
      <SheetHeader className="border-b pr-12">
        <SheetTitle>{title}</SheetTitle>
      </SheetHeader>

      <form className="flex min-h-0 flex-1 flex-col" onSubmit={(e) => { e.preventDefault(); void submitForm(); }}>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor={`${internalMode}-event-title`}>Title</Label>
            <Input
              disabled={isViewMode}
              id={`${internalMode}-event-title`}
              onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
              placeholder="Event title"
              value={form.title}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${internalMode}-event-description`}>
              Description
              <span className="ml-1 text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              className="min-h-20 resize-none"
              disabled={isViewMode}
              id={`${internalMode}-event-description`}
              onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
              placeholder="Event description"
              value={form.description}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`${internalMode}-event-tag`}>Tag</Label>
            <Select
              disabled={isViewMode}
              onValueChange={(tag) => setForm((v) => ({ ...v, tag: tag as EventSheetFormState["tag"] }))}
              value={form.tag}
            >
              <SelectTrigger className="h-9 min-h-9 w-full" id={`${internalMode}-event-tag`}>
                <SelectValue placeholder="Select tag" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  {calendarEventTagOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Start date &amp; time</Label>
            <div className="grid grid-cols-[1fr_120px] gap-2">
              <DatePicker
                date={form.startDate}
                disabled={isViewMode}
                onSelect={(startDate) => setForm((v) => ({ ...v, startDate }))}
              />
              <Input
                className="h-9"
                disabled={isViewMode}
                onChange={(e) => setForm((v) => ({ ...v, startTime: e.target.value }))}
                type="time"
                value={form.startTime}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>End date &amp; time</Label>
            <div className="grid grid-cols-[1fr_120px] gap-2">
              <DatePicker
                date={form.endDate}
                disabled={isViewMode}
                onSelect={(endDate) => setForm((v) => ({ ...v, endDate }))}
              />
              <Input
                className="h-9"
                disabled={isViewMode}
                onChange={(e) => setForm((v) => ({ ...v, endTime: e.target.value }))}
                type="time"
                value={form.endTime}
              />
            </div>
          </div>
        </div>

        {isViewMode ? (
          <SheetFooter className="border-t sm:flex-row sm:justify-end">
            <DeleteConfirmDialog
              ariaLabel="Delete event"
              onConfirm={deleteEvent}
              title="Delete event"
              trigger={
                <Button type="button" variant="danger" size="lg">
                  <UilTrashAlt aria-hidden="true" data-icon="inline-start" />
                  Delete
                </Button>
              }
            >
              Are you sure you want to delete {event?.title || "this event"}? <br />
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
                onClick={() => {
                  resetForm();
                  setInternalMode("view");
                }}
                type="button"
                variant="outline"
                size="lg"
              >
                <XIcon aria-hidden="true" data-icon="inline-start" />
                Cancel
              </Button>
            ) : (
              <Button disabled={isSubmitting} size="lg" onClick={resetForm} type="button" variant="outline">
                <UilRedo aria-hidden="true" data-icon="inline-start" />
                Reset
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
              {isEditMode ? "Save event" : "Add event"}
            </Button>
          </SheetFooter>
        )}
      </form>
    </SheetContent>
  );

  if (trigger) {
    return (
      <Sheet open={isControlled ? open : internalOpen} onOpenChange={updateOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        {sheetContent}
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={updateOpen}>
      {sheetContent}
    </Sheet>
  );
};
