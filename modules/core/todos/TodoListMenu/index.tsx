"use client";

import { type FormEvent, useState } from "react";
import { ArrowUpToLine, EllipsisVertical } from "lucide-react";

import { UilPen } from "@/assets/icons/UilPen";
import { UilTrashAlt } from "@/assets/icons/UilTrashAlt";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appToast } from "@/lib/toast";
import {
  deleteTodoList,
  getTodosErrorMessage,
  moveTodoListToTop,
  updateTodoList,
} from "@/modules/core/todos/functions";
import type { TodoList } from "@/modules/core/todos/models";

type TodoListMenuDialog = "rename" | "move" | "delete" | null;

type TodoListMenuProps = {
  todoList: TodoList;
  onChanged: () => void;
};

export const TodoListMenu = ({ todoList, onChanged }: TodoListMenuProps) => {
  const [dialog, setDialog] = useState<TodoListMenuDialog>(null);
  const [renameTitle, setRenameTitle] = useState(todoList.title);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const closeDialog = () => setDialog(null);

  const openRename = () => {
    setRenameTitle(todoList.title);
    setDialog("rename");
  };

  const handleRename = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!renameTitle.trim()) {
      appToast.error("Please fill the title.");
      return;
    }

    setIsRenaming(true);

    try {
      await updateTodoList(todoList.id, {
        title: renameTitle.trim(),
        ...(todoList.description ? { description: todoList.description } : {}),
        ...(todoList.color ? { color: todoList.color } : {}),
      });
      appToast.success("Todo list renamed.");
      closeDialog();
      onChanged();
    } catch (error) {
      appToast.error(getTodosErrorMessage(error));
    } finally {
      setIsRenaming(false);
    }
  };

  const handleMoveToTop = async () => {
    setIsMoving(true);

    try {
      await moveTodoListToTop(todoList.id);
      appToast.success("Todo list moved to top.");
      closeDialog();
      onChanged();
    } catch (error) {
      appToast.error(getTodosErrorMessage(error));
    } finally {
      setIsMoving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTodoList(todoList.id);
      appToast.success("Todo list deleted.");
      onChanged();
    } catch (error) {
      appToast.error(getTodosErrorMessage(error));
      throw error;
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Todo list menu"
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <EllipsisVertical aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={openRename}>
            <UilPen aria-hidden="true" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("move")}>
            <ArrowUpToLine aria-hidden="true" />
            Move to top
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDialog("delete")}
          >
            <UilTrashAlt aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={dialog === "rename"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeDialog();
          }
        }}
      >
        <DialogContent>
          <form onSubmit={handleRename}>
            <DialogHeader>
              <DialogTitle>Rename todo list</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 py-5">
              <Label htmlFor="rename-todo-list-title">Title</Label>
              <Input
                autoFocus
                id="rename-todo-list-title"
                maxLength={100}
                onChange={(event) => setRenameTitle(event.target.value)}
                placeholder="Todo list title"
                value={renameTitle}
              />
            </div>
            <DialogFooter>
              <Button
                disabled={isRenaming}
                onClick={closeDialog}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button isLoading={isRenaming} type="submit" variant="warning">
                <UilPen aria-hidden="true" data-icon="inline-start" />
                Rename
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialog === "move"}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to top</DialogTitle>
            <DialogDescription className="pb-3 pt-5 text-center">
              Move {todoList.title} to the top of your todo lists?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={isMoving}
              onClick={closeDialog}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button isLoading={isMoving} onClick={handleMoveToTop} type="button" variant="info">
              <ArrowUpToLine aria-hidden="true" data-icon="inline-start" />
              Move to top
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        onConfirm={handleDelete}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeDialog();
          }
        }}
        open={dialog === "delete"}
        title="Delete todo list"
      >
        Are you sure you want to delete {todoList.title}? <br />
        This action cannot be undone.
      </DeleteConfirmDialog>
    </>
  );
};
