import type { ComponentType, SVGProps } from "react";
import {
  BookOpen,
  Bug,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  Equal,
  Layers,
  SquareCheckBig,
} from "lucide-react";

import type { TaskPriority, TaskType } from "./models";

type TaskMeta = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  className: string;
};

export const PRIORITY_CONFIG: Record<TaskPriority, TaskMeta> = {
  lowest: {
    label: "Lowest",
    icon: ChevronsDown,
    className: "text-slate-400",
  },
  low: {
    label: "Low",
    icon: ChevronDown,
    className: "text-sky-600 dark:text-sky-400",
  },
  medium: {
    label: "Medium",
    icon: Equal,
    className: "text-amber-600 dark:text-amber-400",
  },
  high: {
    label: "High",
    icon: ChevronUp,
    className: "text-orange-600 dark:text-orange-400",
  },
  highest: {
    label: "Highest",
    icon: ChevronsUp,
    className: "text-red-600 dark:text-red-400",
  },
};

export const TYPE_CONFIG: Record<TaskType, TaskMeta> = {
  epic: {
    label: "Epic",
    icon: Layers,
    className:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  },
  story: {
    label: "Story",
    icon: BookOpen,
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  task: {
    label: "Task",
    icon: SquareCheckBig,
    className: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  },
  bug: {
    label: "Bug",
    icon: Bug,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};

export const PRIORITY_OPTIONS = Object.keys(PRIORITY_CONFIG) as TaskPriority[];

export const TYPE_OPTIONS = Object.keys(TYPE_CONFIG) as TaskType[];
