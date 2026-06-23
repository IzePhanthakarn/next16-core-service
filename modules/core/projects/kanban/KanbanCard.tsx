"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import type { Task } from "../models";
import { PRIORITY_CONFIG, TYPE_CONFIG } from "../taskMeta";

type TaskCardContentProps = {
  task: Task;
  className?: string;
};

const getAssigneeName = (task: Task) =>
  [task.assignee?.first_name, task.assignee?.last_name]
    .filter((name): name is string => Boolean(name?.trim()))
    .join(" ");

const getAssigneeInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export const TaskCardContent = ({ task, className }: TaskCardContentProps) => {
  const priority = PRIORITY_CONFIG[task.priority];
  const type = TYPE_CONFIG[task.type];
  const PriorityIcon = priority.icon;
  const TypeIcon = type.icon;
  const assigneeName = getAssigneeName(task);

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 shadow-xs transition-colors hover:border-primary/30",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug wrap-break-word">
          {task.title}
        </p>
        <PriorityIcon
          aria-label={`${priority.label} priority`}
          className={cn("size-4 shrink-0", priority.className)}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <Badge className={cn("gap-1 border-transparent", type.className)}>
            <TypeIcon aria-hidden="true" className="size-3" />
            {type.label}
          </Badge>
          {task.tag?.trim() ? (
            <Badge variant="outline">{task.tag}</Badge>
          ) : null}
        </div>
        {task.assignee ? (
          <Avatar size="sm" title={assigneeName || "Assigned user"}>
            <AvatarFallback>
              {getAssigneeInitials(assigneeName) || "?"}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </div>
  );
};

type SortableTaskCardProps = {
  task: Task;
  onOpen: (task: Task) => void;
};

export const SortableTaskCard = ({ task, onOpen }: SortableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      className={cn("touch-none outline-none", isDragging && "opacity-40")}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
    >
      <TaskCardContent className="cursor-grab active:cursor-grabbing" task={task} />
    </div>
  );
};
