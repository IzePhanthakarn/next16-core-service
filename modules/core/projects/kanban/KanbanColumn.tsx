"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { cn } from "@/lib/utils";

import type { BoardColumn, Task } from "../models";
import { SortableTaskCard } from "./KanbanCard";

type KanbanColumnProps = {
  column: BoardColumn;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
};

export const KanbanColumn = ({
  column,
  tasks,
  onOpenTask,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex shrink-0 flex-col overflow-hidden rounded-lg border border-border/80 bg-muted/30">
      <header className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2.5">
        <h3 className="truncate text-sm font-semibold" title={column.name}>
          {column.name}
        </h3>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1.5 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </header>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={cn(
            "flex min-h-32 flex-1 flex-col gap-2 overflow-y-auto p-2 transition-colors",
            isOver && "bg-primary/5"
          )}
          ref={setNodeRef}
        >
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} onOpen={onOpenTask} task={task} />
          ))}

          {tasks.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
              Drop tasks here
            </div>
          ) : null}
        </div>
      </SortableContext>
    </div>
  );
};
