"use client";

import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { CircleDashed } from "lucide-react";

import { LineMdLoadingLoop } from "@/assets/icons/LineMdLoadingLoop";
import { UilClipboardNotes } from "@/assets/icons/UilClipboardNotes";
import { UilNotes } from "@/assets/icons/UilNotes";
import { UilPlusCircle } from "@/assets/icons/UilPlusCircle";
import { UilSmileBeam } from "@/assets/icons/UilSmileBeam";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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

type TodoListStats = {
  activeItems: number;
  completedItems: number;
  progress: number;
  totalItems: number;
};

const sortItemsByPosition = (items: TodoItem[]) =>
  [...items].sort((first, second) => first.position - second.position);

const getTodoListStats = (items: TodoItem[]): TodoListStats => {
  const totalItems = items.length;
  const completedItems = items.filter((item) => item.is_completed).length;
  const activeItems = totalItems - completedItems;

  return {
    activeItems,
    completedItems,
    progress: totalItems ? Math.round((completedItems / totalItems) * 100) : 0,
    totalItems,
  };
};

const getTodoListAccentStyle = (color: string | null): CSSProperties =>
  color?.trim()
    ? {
        "--todo-list-accent": color.trim(),
      } as CSSProperties
    : {};

const TodoListCard = ({ todoList, onChanged }: TodoListCardProps) => {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const stats = getTodoListStats(todoList.items);
  const sortedItems = sortItemsByPosition(todoList.items);

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
    <div
      className="flex h-[540px] flex-col overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm"
      style={getTodoListAccentStyle(todoList.color)}
    >
      <div className="h-1 bg-primary/80 [background-color:var(--todo-list-accent,var(--primary))]" />
      <div className="flex flex-col gap-4 border-b bg-muted/25 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full bg-primary [background-color:var(--todo-list-accent,var(--primary))]" />
              <h2
                className="min-w-0 flex-1 truncate text-base font-semibold"
                title={todoList.title}
              >
                {todoList.title}
              </h2>
            </div>
          </div>
          <TodoListMenu onChanged={onChanged} todoList={todoList} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-foreground">
              {stats.progress}% complete
            </span>
            <span className="text-muted-foreground">
              {stats.completedItems}/{stats.totalItems} done
            </span>
          </div>
          <Progress
            aria-label={`${todoList.title} completion`}
            className="h-1.5 bg-background"
            value={stats.progress}
          />
        </div>

        <form className="flex gap-2" onSubmit={handleAddItem}>
          <Input
            className="bg-background"
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
          <ul className="flex flex-col gap-2.5">
            {sortedItems.map((item) => (
              <li
                className={cn(
                  "group flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5 text-sm shadow-xs transition-colors hover:border-primary/30 hover:bg-muted/30",
                  item.is_completed && "bg-muted/30"
                )}
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
                    "min-w-0 flex-1 break-words leading-5",
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
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 px-6 text-center text-sm text-muted-foreground">
            <div className="flex size-12 items-center justify-center rounded-full bg-background text-primary shadow-sm">
              <UilNotes aria-hidden="true" className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">No items yet</p>
              <p className="text-xs">
                Add the first task and this list will start taking shape.
              </p>
            </div>
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
      <div className="flex h-[520px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 text-sm text-muted-foreground">
        <LineMdLoadingLoop className="h-10 w-10 text-primary" />
        Loading todo lists...
      </div>
    );
  } else if (errorMessage) {
    content = (
      <div className="flex h-[520px] flex-col items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-6 text-center text-sm text-destructive">
        <CircleDashed aria-hidden="true" className="size-8" />
        <p>{errorMessage}</p>
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
      <div className="flex h-[520px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-muted/20 px-6 text-center text-sm text-muted-foreground">
        <div className="flex size-16 items-center justify-center rounded-full bg-card text-primary shadow-sm">
          <UilSmileBeam aria-hidden="true" className="size-8" />
        </div>
        <div className="max-w-sm space-y-1">
          <p className="font-medium text-foreground">No todo lists yet</p>
          <p>Create your first list to start organizing tasks by project, day, or workflow.</p>
        </div>
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
