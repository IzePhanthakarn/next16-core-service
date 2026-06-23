import type { ReactNode } from "react";

import type {
  BoardColumn,
  Sprint,
  Task,
  TaskPriority,
  TaskType,
} from "@/modules/core/projects/models";

export type CreateTaskSheetFormState = {
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  tag: string;
  columnId: string;
  sprintId: string;
  assigneeId: string;
  storyPoints: string;
};

export type CreateTaskSheetProps = {
  projectId: string;
  sprintId?: string | null;
  onCreated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  columns?: BoardColumn[];
  sprints?: Sprint[];
  task?: Task;
  trigger?: ReactNode;
};

export const getDefaultCreateTaskForm = (): CreateTaskSheetFormState => ({
  title: "",
  description: "",
  type: "task",
  priority: "medium",
  tag: "",
  columnId: "",
  sprintId: "backlog",
  assigneeId: "unassigned",
  storyPoints: "",
});
