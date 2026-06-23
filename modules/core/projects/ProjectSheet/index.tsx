"use client";

import { type FormEvent, useState } from "react";

import { UilPen } from "@/assets/icons/UilPen";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilRedo } from "@/assets/icons/UilRedo";
import { UilX } from "@/assets/icons/UilX";
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
  createProject,
  getProjectErrorMessage,
  updateProject,
} from "@/modules/core/projects/functions";

import {
  getDefaultProjectSheetForm,
  type ProjectSheetFormState,
  type ProjectSheetProps,
} from "./models";

export const ProjectSheet = ({
  mode,
  project,
  onSaved,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: ProjectSheetProps) => {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const [form, setForm] = useState<ProjectSheetFormState>(() =>
    getDefaultProjectSheetForm(project)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = mode === "edit";

  // Reset the form to its defaults whenever the sheet transitions to open.
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setForm(getDefaultProjectSheetForm(project));
    }
  }

  const updateOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const resetForm = () => {
    setForm(getDefaultProjectSheetForm(project));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      appToast.error("Please fill the project title.");
      return;
    }

    if (!form.description.trim()) {
      appToast.error("Please fill the project description.");
      return;
    }

    setIsSubmitting(true);

    try {
      const saved =
        isEdit && project
          ? await updateProject(project.id, {
              title: form.title.trim(),
              description: form.description.trim(),
              status: project.status,
              start_date: project.start_date,
              finish_date: project.finish_date,
            })
          : await createProject({
              title: form.title.trim(),
              description: form.description.trim(),
              start_date: new Date().toISOString(),
            });

      appToast.success(isEdit ? "Project updated." : "Project created.");
      updateOpen(false);
      onSaved?.(saved);
    } catch (error) {
      appToast.error(getProjectErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={updateOpen}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>{isEdit ? "Edit project" : "Create project"}</SheetTitle>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor={`${mode}-project-title`}>Title</Label>
              <Input
                autoFocus
                id={`${mode}-project-title`}
                maxLength={255}
                onChange={(event) =>
                  setForm((value) => ({ ...value, title: event.target.value }))
                }
                placeholder="Project title"
                value={form.title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${mode}-project-description`}>Description</Label>
              <Textarea
                className="min-h-32 resize-none"
                id={`${mode}-project-description`}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    description: event.target.value,
                  }))
                }
                placeholder="What is this project about?"
                value={form.description}
              />
            </div>
          </div>

          <SheetFooter className="border-t sm:flex-row sm:justify-end">
            {isEdit ? (
              <Button
                disabled={isSubmitting}
                onClick={() => updateOpen(false)}
                size="lg"
                type="button"
                variant="outline"
              >
                <UilX aria-hidden="true" data-icon="inline-start" />
                Cancel
              </Button>
            ) : (
              <Button
                disabled={isSubmitting}
                onClick={resetForm}
                size="lg"
                type="button"
                variant="outline"
              >
                <UilRedo aria-hidden="true" data-icon="inline-start" />
                Reset form
              </Button>
            )}
            <Button
              isLoading={isSubmitting}
              size="lg"
              type="submit"
              variant={isEdit ? "warning" : "success"}
            >
              {isEdit ? (
                <UilPen aria-hidden="true" data-icon="inline-start" />
              ) : (
                <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
              )}
              {isEdit ? "Save project" : "Create project"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
