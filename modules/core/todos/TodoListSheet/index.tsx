"use client";

import { type FormEvent, useState } from "react";

import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilRedo } from "@/assets/icons/UilRedo";
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
import { createTodoList, getTodosErrorMessage } from "@/modules/core/todos/functions";

import {
  getDefaultTodoListSheetForm,
  type TodoListSheetFormState,
  type TodoListSheetProps,
} from "./models";

export const TodoListSheet = ({ onCreated, trigger }: TodoListSheetProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TodoListSheetFormState>(
    getDefaultTodoListSheetForm
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setForm(getDefaultTodoListSheetForm());
    }
    setOpen(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      appToast.error("Please fill the title.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createTodoList({
        title: form.title.trim(),
        ...(form.color.trim() ? { color: form.color.trim() } : {}),
      });
      appToast.success("Todo list created.");
      updateOpen(false);
      onCreated?.();
    } catch (error) {
      appToast.error(getTodosErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={updateOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>Add todo list</SheetTitle>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="todo-list-title">Title</Label>
              <Input
                id="todo-list-title"
                maxLength={100}
                onChange={(event) =>
                  setForm((value) => ({ ...value, title: event.target.value }))
                }
                placeholder="Todo list title"
                value={form.title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="todo-list-color">Color</Label>
              <Input
                id="todo-list-color"
                maxLength={20}
                onChange={(event) =>
                  setForm((value) => ({ ...value, color: event.target.value }))
                }
                placeholder="e.g. #f97316"
                value={form.color}
              />
            </div>
          </div>

          <SheetFooter className="border-t sm:flex-row sm:justify-end">
            <Button
              disabled={isSubmitting}
              onClick={() => setForm(getDefaultTodoListSheetForm())}
              type="button"
              variant="outline"
              size="lg"
            >
              <UilRedo aria-hidden="true" data-icon="inline-start" />
              Reset form
            </Button>
            <Button isLoading={isSubmitting} type="submit" size="lg" variant="success">
              <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
              Add todo list
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
