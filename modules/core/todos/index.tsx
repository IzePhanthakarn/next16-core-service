"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { UilClipboardNotes } from "@/assets/icons/UilClipboardNotes";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  buildReorderedItemIds,
  createTodoItem,
  deleteTodoItem,
  getTodoLists,
  getTodosErrorMessage,
  reorderTodoItems,
  toggleTodoItem,
} from "./functions";
import type { TodoItem, TodoList } from "./models";
import { TodoListMenu } from "./TodoListMenu";
import { TodoListSheet } from "./TodoListSheet";

const useTodoLists = () => {
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const reloadTodoLists = () => {
    setReloadKey((value) => value + 1);
  };

  useEffect(() => {
    const loadTodoLists = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getTodoLists();
        setTodoLists(data);
      } catch (error) {
        setErrorMessage(getTodosErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    void loadTodoLists();
  }, [reloadKey]);

  return { todoLists, isLoading, errorMessage, reloadTodoLists };
};

type TodoListCardProps = {
  todoList: TodoList;
  onChanged: () => void;
};

const sortItemsByPosition = (items: TodoItem[]) =>
  [...items].sort((first, second) => first.position - second.position);

const TodoListCard = ({ todoList, onChanged }: TodoListCardProps) => {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleAddItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      appToast.error("Please fill the item title.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createTodoItem(todoList.id, { title: title.trim() });
      setTitle("");
      onChanged();
    } catch (error) {
      appToast.error(getTodosErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (item: TodoItem) => {
    setTogglingId(item.id);

    try {
      await toggleTodoItem(item.id);
      await reorderTodoItems(
        todoList.id,
        buildReorderedItemIds(todoList.items, item.id)
      );
      onChanged();
    } catch (error) {
      appToast.error(getTodosErrorMessage(error));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (item: TodoItem) => {
    try {
      await deleteTodoItem(item.id);
      appToast.success("Todo item deleted.");
      onChanged();
    } catch (error) {
      appToast.error(getTodosErrorMessage(error));
      throw error;
    }
  };

  return (
    <div className="flex h-[500px] flex-col overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-col gap-3 border-b p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="min-w-0 flex-1 truncate font-semibold" title={todoList.title}>
            {todoList.title}
          </h2>
          <TodoListMenu onChanged={onChanged} todoList={todoList} />
        </div>

        <form className="flex gap-2" onSubmit={handleAddItem}>
          <Input
            maxLength={100}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="New item"
            value={title}
          />
          <Button
            isLoading={isSubmitting}
            size="icon"
            type="submit"
            variant="success"
            aria-label="Add item"
          >
            <UilPlusCircle aria-hidden="true" />
          </Button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {todoList.items.length ? (
          <ul className="flex flex-col gap-2">
            {sortItemsByPosition(todoList.items).map((item) => (
              <li
                className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
                key={item.id}
              >
                <Checkbox
                  aria-label={`Mark ${item.title} as ${item.is_completed ? "incomplete" : "complete"}`}
                  checked={item.is_completed}
                  disabled={togglingId === item.id}
                  onCheckedChange={() => handleToggle(item)}
                />
                <span
                  className={cn(
                    "min-w-0 flex-1 break-words",
                    item.is_completed && "text-muted-foreground line-through"
                  )}
                >
                  {item.title}
                </span>
                <DeleteConfirmDialog
                  ariaLabel={`Delete ${item.title}`}
                  onConfirm={() => handleDelete(item)}
                  title="Delete todo item"
                >
                  Are you sure you want to delete {item.title}? <br />
                  This action cannot be undone.
                </DeleteConfirmDialog>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No items yet.
          </div>
        )}
      </div>
    </div>
  );
};

export const TodosPage = () => {
  const { todoLists, isLoading, errorMessage, reloadTodoLists } = useTodoLists();

  let content: ReactNode;

  if (isLoading) {
    content = (
      <div className="flex h-[500px] items-center justify-center text-sm text-muted-foreground">
        <LineMdLoadingLoop className="h-10 w-10" />
      </div>
    );
  } else if (errorMessage) {
    content = (
      <div className="flex h-[500px] items-center justify-center text-sm text-destructive">
        {errorMessage}
      </div>
    );
  } else if (todoLists.length) {
    content = (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {todoLists.map((todoList) => (
          <TodoListCard
            key={todoList.id}
            onChanged={reloadTodoLists}
            todoList={todoList}
          />
        ))}
      </div>
    );
  } else {
    content = (
      <div className="flex h-[500px] items-center justify-center text-sm text-muted-foreground">
        No todo lists yet. Click Add to create one.
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UilClipboardNotes className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-semibold">Todo Lists</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Organize your tasks into lists and track them in one place.
          </p>
        </div>
        <TodoListSheet
          onCreated={reloadTodoLists}
          trigger={
            <Button
              className="w-fit font-medium"
              size="lg"
              type="button"
              variant="success"
            >
              <UilPlusCircle aria-hidden="true" data-icon="inline-start" />
              Add
            </Button>
          }
        />
      </div>

      <Separator />

      {content}
    </section>
  );
};
