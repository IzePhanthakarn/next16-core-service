import type { ProjectStatus } from "./models";

type ProjectStatusMeta = {
  label: string;
  className: string;
};

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, ProjectStatusMeta> = {
  planning: {
    label: "Planning",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300",
  },
  active: {
    label: "Active",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  completed: {
    label: "Completed",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  },
  on_hold: {
    label: "On hold",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
};

export const PROJECT_STATUS_OPTIONS = Object.keys(
  PROJECT_STATUS_CONFIG
) as ProjectStatus[];
