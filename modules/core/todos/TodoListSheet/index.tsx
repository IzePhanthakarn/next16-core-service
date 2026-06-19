"use client";

import { type FormEvent, useState } from "react";

import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appToast } from "@/lib/toast";
import {
  createTodoList,
  getTodosErrorMessage,
} from "@/modules/core/todos/functions";

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
    <Dialog open={open} onOpenChange={updateOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add todo list</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2 py-5">
            <Label htmlFor="todo-list-title">Title</Label>
            <Input
              autoFocus
              id="todo-list-title"
              maxLength={100}
              onChange={(event) =>
                setForm((value) => ({ ...value, title: event.target.value }))
              }
              placeholder="Todo list title"
              value={form.title}
            />
          </div>

          <DialogFooter>
            <Button
              disabled={isSubmitting}
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button isLoading={isSubmitting} type="submit" variant="success">
              <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
