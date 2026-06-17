"use client";

import { RotateCcwIcon } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
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
  createWorkLog,
  getWorkLogsErrorMessage,
  updateWorkLog,
} from "@/modules/core/work-logs/functions";

import {
  buildWorkLogSheetPayload,
  formatDatePickerLabel,
  getDefaultWorkLogSheetForm,
  getWorkLogSheetFormFromWorkLog,
  getWorkLogSheetTitle,
} from "./functions";
import type { WorkLogSheetFormState, WorkLogSheetProps } from "./models";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { moodScoreOptions, productivityScoreOptions } from "@/constants/worklogs";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilCalendar } from "@/assets/icons/UilCalendar";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import type { CachedPropertyOption } from "@/modules/core/properties/models";
import PROPERTY_TYPES from "@/constants/properties";
import { UilRedo } from "@/assets/icons/UilRedo";

type DateLoggedPickerProps = {
  date?: Date;
  disabled?: boolean;
  onSelect: (date?: Date) => void;
};

const DateLoggedPicker = ({
  date,
  disabled,
  onSelect,
}: DateLoggedPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full h-10 justify-start text-left font-normal",
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

export const WorkLogSheet = ({
  mode,
  onSaved,
  trigger,
  workLog,
}: WorkLogSheetProps) => {
  const [open, setOpen] = useState(false);
  const initialForm = useMemo(
    () => getWorkLogSheetFormFromWorkLog(workLog),
    [workLog],
  );
  const [form, setForm] = useState<WorkLogSheetFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagOptions, setTagOptions] = useState<CachedPropertyOption[]>([]);
  const anchor = useComboboxAnchor();

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const title = getWorkLogSheetTitle(mode);

  const updateOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setForm(initialForm);
      try {
        const cached = sessionStorage.getItem(PROPERTY_TYPES.WORK_TAGS);
        setTagOptions(cached ? (JSON.parse(cached) as CachedPropertyOption[]) : []);
      } catch {
        setTagOptions([]);
      }
    }
    setOpen(nextOpen);
  };

  const resetForm = () => {
    if (isCreateMode) {
      setForm(getDefaultWorkLogSheetForm());
      return;
    }

    setForm((value) => ({
      ...initialForm,
      dateLogged: value.dateLogged,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isViewMode) {
      return;
    }

    if (!form.title.trim() || !form.content.trim() || !form.dateLogged) {
      appToast.error("Please fill title, content, and date logged.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildWorkLogSheetPayload(form);

      if (isEditMode) {
        if (!workLog?.id) {
          throw new Error("Work log id is required.");
        }

        await updateWorkLog(workLog.id, {
          ...payload,
          user_id: workLog.user_id,
        });
        appToast.success("Work log updated.");
      } else {
        await createWorkLog(payload);
        appToast.success("Work log added.");
      }

      updateOpen(false);
      onSaved?.();
    } catch (error) {
      appToast.error(getWorkLogsErrorMessage(error));
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
              <Label htmlFor={`${mode}-work-log-title`}>Title</Label>
              <Input
                disabled={isViewMode}
                id={`${mode}-work-log-title`}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    title: event.target.value,
                  }))
                }
                placeholder="Work log title"
                value={form.title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${mode}-work-log-content`}>Content</Label>
              <Textarea
                className="min-h-32 resize-none"
                disabled={isViewMode}
                id={`${mode}-work-log-content`}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    content: event.target.value,
                  }))
                }
                placeholder="What did you work on?"
                value={form.content}
              />
            </div>

            <div className="grid gap-2">
              <Label>Date logged</Label>
              <DateLoggedPicker
                date={form.dateLogged}
                disabled={isViewMode || isEditMode}
                onSelect={(dateLogged) =>
                  setForm((value) => ({
                    ...value,
                    dateLogged,
                  }))
                }
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`${mode}-work-log-mood`}>Mood score</Label>
                <Select
                  disabled={isViewMode}
                  onValueChange={(mood) =>
                    setForm((value) => ({
                      ...value,
                      moodScore: mood,
                    }))
                  }
                  value={form.moodScore}
                >
                  <SelectTrigger className="w-full h-10 min-h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {moodScoreOptions.map((mood) => (
                        <SelectItem key={mood.value} value={mood.value}>
                          {mood.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`${mode}-work-log-productivity`}>
                  Productivity score
                </Label>
                <Select
                  disabled={isViewMode}
                  onValueChange={(score) =>
                    setForm((value) => ({
                      ...value,
                      productivityScore: score,
                    }))
                  }
                  value={form.productivityScore}
                >
                  <SelectTrigger className="w-full h-10 min-h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {productivityScoreOptions.map((score) => (
                        <SelectItem key={score.value} value={score.value}>
                          {score.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${mode}-work-log-tags`}>Tags</Label>
              <Combobox
                autoHighlight
                disabled={isViewMode}
                items={tagOptions.map((opt) => opt.value)}
                itemToStringValue={(item: string) =>
                  tagOptions.find((opt) => opt.value === item)?.label ?? item
                }
                multiple
                onValueChange={(tags) =>
                  setForm((value) => ({ ...value, tags: tags as string[] }))
                }
                value={form.tags}
              >
                <ComboboxChips ref={anchor}>
                  <ComboboxValue>
                    {(values) => (
                      <>
                        {(values as string[]).map((tagValue) => (
                          <ComboboxChip key={tagValue} showRemove={!isViewMode}>
                            {tagOptions.find((opt) => opt.value === tagValue)?.label ?? tagValue}
                          </ComboboxChip>
                        ))}
                        {!isViewMode && (
                          <ComboboxChipsInput
                            id={`${mode}-work-log-tags`}
                            placeholder="Select tags..."
                          />
                        )}
                      </>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                {!isViewMode && (
                  <ComboboxContent anchor={anchor}>
                    <ComboboxEmpty>No tags found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item as string} value={item as string}>
                          {tagOptions.find((opt) => opt.value === (item as string))?.label ?? (item as string)}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                )}
              </Combobox>
            </div>
          </div>

          {!isViewMode ? (
            <SheetFooter className="border-t sm:flex-row sm:justify-end">
              <Button
                disabled={isSubmitting}
                onClick={resetForm}
                type="button"
                variant="outline"
              >
                <UilRedo/>
                Reset form
              </Button>
              <Button
                isLoading={isSubmitting}
                type="submit"
                variant={isEditMode ? "warning" : "success"}
              >
                <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
                {isEditMode ? "Edit work log" : "Add work log"}
              </Button>
            </SheetFooter>
          ) : null}
        </form>
      </SheetContent>
    </Sheet>
  );
};
