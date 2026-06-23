import type { ReactNode } from "react";

import type { Project } from "@/modules/core/projects/models";

export type ProjectSheetMode = "create" | "edit";

export type ProjectSheetFormState = {
  title: string;
  description: string;
};

export type ProjectSheetProps = {
  mode: ProjectSheetMode;
  project?: Project;
  onSaved?: (project: Project) => void;
  /** Optional trigger. Omit when controlling the sheet via `open`. */
  trigger?: ReactNode;
  /** Controlled open state. When provided, the sheet is fully controlled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const getDefaultProjectSheetForm = (
  project?: Project
): ProjectSheetFormState => ({
  title: project?.title ?? "",
  description: project?.description ?? "",
});
