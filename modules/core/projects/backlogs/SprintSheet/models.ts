import type { ReactNode } from "react";

import type { Sprint } from "../../models";

export type SprintSheetFormState = {
  name: string;
  goal: string;
  startDate?: Date;
  endDate?: Date;
};

export type SprintSheetProps = {
  projectId: string;
  onSaved?: () => void;
  sprint?: Sprint;
  trigger: ReactNode;
};

export const getSprintForm = (sprint?: Sprint): SprintSheetFormState => ({
  name: sprint?.name ?? "",
  goal: sprint?.goal ?? "",
  startDate: sprint?.start_date ? new Date(sprint.start_date) : undefined,
  endDate: sprint?.end_date ? new Date(sprint.end_date) : undefined,
});
